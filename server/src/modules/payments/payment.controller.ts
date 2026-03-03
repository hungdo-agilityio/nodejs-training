import { Request, Response } from 'express';
import { IPaymentController } from './payment.controller.interface';
import { PaymentValidator } from './payment.validator';
import { IPaymentService } from './payment.service.interface';
import { BookingBusinessService } from '@modules/bookings/booking.service';
import { BookingStatus, ILogger } from '@shared/types';
import { ApiError } from '@shared/errors';

export class PaymentController implements IPaymentController {
  constructor(
    private paymentService: IPaymentService,
    private bookingService: BookingBusinessService,
    private logger: ILogger
  ) {}

  async authorizePayment(req: Request, res: Response): Promise<void> {
    const validation = PaymentValidator.validateAuthorize(req.body);

    if (!validation.valid) {
      res.status(validation.error.statusCode).json(validation.error.toJSON());
      return;
    }

    const { bookingId, idempotencyKey } = req.body;

    // Get booking details
    const bookingResult = await this.bookingService.getBookingById(
      bookingId,
      req.user!.id
    );

    if (bookingResult.sendIfErr(res)) return;

    const booking = bookingResult.getValue();

    // Verify booking status is PENDING_PAYMENT
    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      const error = ApiError.validationError(
        `Cannot authorize payment for booking with status ${booking.status}. Booking must be in PENDING_PAYMENT status.`
      );
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    // Create Stripe PaymentIntent
    // Note: Stripe's idempotency key prevents duplicate payment intents
    const paymentIntentResult = await this.paymentService.createPaymentIntent({
      amount: booking.totalPrice,
      currency: 'usd',
      bookingId: booking.id,
      userId: req.user!.id,
      idempotencyKey,
    });

    if (paymentIntentResult.sendIfErr(res)) return;

    const paymentIntent = paymentIntentResult.getValue();

    // Update booking with payment intent ID
    const updateResult = await this.bookingService.updateBookingPaymentIntent(
      bookingId,
      paymentIntent.id
    );

    if (updateResult.isErr()) {
      // Compensate: cancel the PaymentIntent to avoid an orphaned card hold.
      // Best-effort — log failure but continue returning the original error.
      const cancelResult = await this.paymentService.cancelPaymentIntent(
        paymentIntent.id
      );

      if (cancelResult.isErr()) {
        this.logger.error(
          `Failed to cancel PaymentIntent ${paymentIntent.id} after booking update failure. Manual cleanup required.`,
          new Error(cancelResult.getError().message)
        );
      }

      const error = updateResult.getError();
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    // Return client secret for frontend
    res.status(200).json({
      data: {
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount / 100, // Convert back to dollars
        currency: paymentIntent.currency,
      },
    });
  }

  async createPaymentIntent(req: Request, res: Response): Promise<void> {
    const validation = PaymentValidator.validateCreateIntent(req.body);

    if (!validation.valid) {
      res.status(validation.error.statusCode).json(validation.error.toJSON());
      return;
    }

    const { serviceIds, appointmentDate, appointmentTime } = req.body;

    // Validate services and calculate total price
    const validationResult =
      await this.bookingService.validateServicesAndCalculateTotals(serviceIds);

    if (validationResult.sendIfErr(res)) return;

    const { totalPrice, totalDurationMinutes } = validationResult.getValue();

    // Check capacity availability
    const capacityResult = await this.bookingService.checkCapacityAvailability(
      appointmentDate,
      appointmentTime,
      totalDurationMinutes
    );

    if (capacityResult.sendIfErr(res)) return;

    // Create Stripe PaymentIntent (idempotency key derived from params in service)
    const paymentIntentResult = await this.paymentService.createPaymentIntent({
      amount: totalPrice,
      currency: 'usd',
      userId: req.user!.id,
      serviceIds,
      appointmentDate,
      appointmentTime,
    });

    if (paymentIntentResult.sendIfErr(res)) return;

    const paymentIntent = paymentIntentResult.getValue();

    res.status(200).json({
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
      },
    });
  }
}
