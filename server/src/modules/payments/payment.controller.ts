import { Request, Response } from 'express';
import { IPaymentController } from './payment.controller.interface';
import { IStripeService } from './stripe.service.interface';
import { BookingBusinessService } from '@modules/bookings/booking.service';
import { BookingStatus } from '@shared/types';
import { ApiError } from '@shared/errors';

export class PaymentController implements IPaymentController {
  constructor(
    private stripeService: IStripeService,
    private bookingService: BookingBusinessService
  ) {}

  async authorizePayment(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      const error = ApiError.unauthorized('Authentication required');
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    const { bookingId, idempotencyKey } = req.body;

    // Validate required fields
    if (!bookingId) {
      const error = ApiError.validationError('bookingId is required');
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    if (!idempotencyKey) {
      const error = ApiError.validationError('idempotencyKey is required');
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    // Get booking details
    const bookingResult = await this.bookingService.getBookingById(
      bookingId,
      req.user.id
    );

    if (bookingResult.isErr()) {
      const error = bookingResult.getError();
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

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
    const paymentIntentResult = await this.stripeService.createPaymentIntent({
      amount: Number(booking.totalPrice),
      currency: 'usd',
      bookingId: booking.id,
      userId: req.user.id,
      idempotencyKey,
    });

    if (paymentIntentResult.isErr()) {
      const error = paymentIntentResult.getError();
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    const paymentIntent = paymentIntentResult.getValue();

    // Update booking with payment intent ID
    const updateResult = await this.bookingService.updateBookingPaymentIntent(
      bookingId,
      paymentIntent.id
    );

    if (updateResult.isErr()) {
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
}
