import { Request, Response } from 'express';
import Stripe from 'stripe';
import { IWebhookController } from './webhook.controller.interface';
import { IPaymentService } from './payment.service.interface';
import { BookingBusinessService } from '@modules/bookings/booking.service';
import { ILogger, BookingStatus } from '@shared/types';
import { Result } from '@shared/utils';
import { ApiError } from '@shared/errors';

export class WebhookController implements IWebhookController {
  constructor(
    private paymentService: IPaymentService,
    private bookingService: BookingBusinessService,
    private logger: ILogger
  ) {}

  async handleStripeWebhook(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'];

    if (!signature || typeof signature !== 'string') {
      res.status(400).send('Missing stripe-signature header');
      return;
    }

    // Get raw body as string
    const payload = req.body.toString('utf8');

    // Verify webhook signature
    const eventResult = this.paymentService.verifyWebhookSignature(
      payload,
      signature
    );

    if (eventResult.isErr()) {
      res.status(401).send('Invalid signature');
      return;
    }

    const event = eventResult.getValue();

    this.logger.info(`Received Stripe webhook: ${event.type} (${event.id})`);

    // Handle different event types
    let result: Result<void, ApiError>;

    switch (event.type) {
      case 'payment_intent.amount_capturable_updated':
        // Fired when a payment is authorized (manual capture) — set AUTHORIZED
        result = await this.handlePaymentAuthorized(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.succeeded':
        // Fired when payment is captured — check-in flow already advanced the
        // booking to CHECKED_IN before capturing, so no status change needed.
        result = Result.ok(undefined);
        break;

      case 'payment_intent.payment_failed':
        result = await this.handlePaymentIntentFailed(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'charge.refunded':
        result = await this.handleChargeRefunded(
          event.data.object as Stripe.Charge
        );
        break;

      default:
        result = Result.ok(undefined);
    }

    if (result.isErr()) {
      const error = result.getError();
      this.logger.error(
        `Webhook processing failed for ${event.type} (${event.id}): ${error.message}`
      );

      if (error.statusCode >= 500) {
        res.status(500).json({ received: false });
        return;
      }
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  }

  private async handlePaymentAuthorized(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<Result<void, ApiError>> {
    const bookingId = paymentIntent.metadata.bookingId;

    if (!bookingId) {
      return Result.ok(undefined);
    }

    return this.bookingService.updateBookingStatus(
      bookingId,
      BookingStatus.AUTHORIZED
    );
  }

  private async handlePaymentIntentFailed(
    paymentIntent: Stripe.PaymentIntent
  ): Promise<Result<void, ApiError>> {
    const bookingId = paymentIntent.metadata.bookingId;

    if (!bookingId) {
      return Result.ok(undefined);
    }

    return this.bookingService.updateBookingStatus(
      bookingId,
      BookingStatus.PAYMENT_FAILED
    );
  }

  private async handleChargeRefunded(
    charge: Stripe.Charge
  ): Promise<Result<void, ApiError>> {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;

    if (!paymentIntentId) {
      return Result.err(
        ApiError.validationError(`Charge ${charge.id} missing payment_intent`)
      );
    }

    const bookingResult =
      await this.bookingService.getBookingByPaymentIntentId(paymentIntentId);

    if (bookingResult.isErr()) {
      return Result.err(bookingResult.getError());
    }

    const booking = bookingResult.getValue();

    // Only update to CANCELLED if it's a full refund
    if (charge.amount_refunded === charge.amount) {
      return this.bookingService.updateBookingStatus(
        booking.id,
        BookingStatus.CANCELLED
      );
    }

    // Partial refund - no status change needed
    return Result.ok(undefined);
  }
}
