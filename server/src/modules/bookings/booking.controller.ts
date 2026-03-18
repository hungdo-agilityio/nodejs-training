import { Request, Response } from 'express';
import { IBookingController } from './booking.controller.interface';
import { BookingBusinessService } from './booking.service';
import { CancelBookingResult } from './booking.service.interface';
import { BookingValidator } from './booking.validator';
import { IPaymentService } from '@modules/payments/payment.service.interface';
import { PaymentMethod, BookingStatus, ILogger } from '@shared/types';
import { ApiError } from '@shared/errors';
import { Result } from '@shared/utils';

export class BookingController implements IBookingController {
  constructor(
    private bookingService: BookingBusinessService,
    private paymentService: IPaymentService,
    private logger: ILogger
  ) {}

  async createBooking(req: Request, res: Response): Promise<void> {
    const validation = BookingValidator.validateCreate(req.body);

    if (!validation.valid) {
      res.status(validation.error.statusCode).json(validation.error.toJSON());
      return;
    }

    const {
      serviceIds,
      appointmentDate,
      appointmentTime,
      paymentMethod,
      notes,
      stripePaymentIntentId,
    } = req.body;

    const result = await this.bookingService.createBooking({
      userId: req.user!.id,
      serviceIds,
      appointmentDate,
      appointmentTime,
      paymentMethod: paymentMethod as PaymentMethod,
      notes,
      stripePaymentIntentId,
    });

    if (result.sendIfErr(res)) return;

    const booking = result.getValue();
    res.status(201).json({ data: booking });
  }

  async getBookings(req: Request, res: Response): Promise<void> {
    const {
      status,
      payment_method,
      service_id,
      date,
      start_date,
      end_date,
      sort_by,
      page,
      limit,
    } = req.query;

    const validation = BookingValidator.validateGetBookings(req.query);

    if (!validation.valid) {
      res.status(validation.error.statusCode).json(validation.error.toJSON());
      return;
    }

    const result = await this.bookingService.getBookings({
      userId: req.user!.id, // Users can only see their own bookings
      status: status as BookingStatus | undefined,
      paymentMethod: payment_method as PaymentMethod | undefined,
      serviceId: service_id as string | undefined,
      date: date as string | undefined,
      startDate: start_date as string | undefined,
      endDate: end_date as string | undefined,
      sortBy: sort_by as 'upcoming' | 'recent' | 'past' | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    if (result.sendIfErr(res)) return;

    res.json(result.getValue());
  }

  async getBookingById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const result = await this.bookingService.getBookingById(
      id as string,
      req.user!.id
    );

    if (result.sendIfErr(res)) return;

    res.json({ data: result.getValue() });
  }

  async cancelBooking(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const result = await this.bookingService.cancelBooking(
      id as string,
      req.user!.id
    );

    if (result.sendIfErr(res)) return;

    const cancelResult = result.getValue();
    const reversalResult = await this.reverseStripePayment(cancelResult);

    if (reversalResult.isErr()) {
      const error = reversalResult.getError();
      this.logger.error(
        `Payment reversal failed for cancelled booking ${cancelResult.id}. Manual intervention required.`,
        new Error(error.message)
      );
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    const refundInitiated = reversalResult.getValue();
    res.json({
      data: {
        id: cancelResult.id,
        status: cancelResult.status,
        paymentMethod: cancelResult.paymentMethod,
        cancelledAt: cancelResult.cancelledAt,
        refundInitiated,
        ...(refundInitiated && { refundAmount: cancelResult.totalPrice }),
      },
    });
  }

  async getDailyBookings(req: Request, res: Response): Promise<void> {
    const { date, exclude_completed } = req.query;

    // Default to today if no date provided
    const targetDate =
      (date as string) || new Date().toISOString().split('T')[0];

    // Parse exclude_completed parameter (default to false)
    const excludeCompleted = exclude_completed === 'true';

    const result = await this.bookingService.getDailyBookings(
      targetDate,
      excludeCompleted
    );

    if (result.sendIfErr(res)) return;

    res.json(result.getValue());
  }

  async checkInBooking(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const result = await this.bookingService.checkInBooking(id as string);

    if (result.sendIfErr(res)) return;

    res.json({ data: result.getValue() });
  }

  async completeBooking(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const result = await this.bookingService.completeBooking(id as string);

    if (result.sendIfErr(res)) return;

    res.json({ data: result.getValue() });
  }

  async noShowBooking(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const result = await this.bookingService.noShowBooking(id as string);

    if (result.sendIfErr(res)) return;

    res.json({ data: result.getValue() });
  }

  /**
   * Reverse a Stripe payment based on the booking's previous status.
   * AUTHORIZED (uncaptured hold) → cancel the PaymentIntent
   * CONFIRMED (captured charge) → create a refund
   */
  private async reverseStripePayment(
    cancelResult: CancelBookingResult
  ): Promise<Result<boolean, ApiError>> {
    if (
      cancelResult.paymentMethod !== PaymentMethod.STRIPE ||
      !cancelResult.stripePaymentIntentId
    ) {
      return Result.ok(false);
    }

    const { previousStatus, stripePaymentIntentId } = cancelResult;

    const reversalActions: Partial<
      Record<BookingStatus, () => Promise<Result<unknown, ApiError>>>
    > = {
      [BookingStatus.AUTHORIZED]: () =>
        this.paymentService.cancelPaymentIntent(stripePaymentIntentId),
      [BookingStatus.CONFIRMED]: () =>
        this.paymentService.createRefund(stripePaymentIntentId),
    };

    const action = reversalActions[previousStatus];
    if (!action) return Result.ok(false);

    const result = await action();
    if (result.isErr()) return Result.err(result.getError());
    return Result.ok(true);
  }
}
