import { Request, Response } from 'express';
import Stripe from 'stripe';
import { IWebhookController } from './webhook.controller.interface';
import { IStripeService } from './stripe.service.interface';
import { BookingBusinessService } from '@modules/bookings/booking.service';
import { ILogger, BookingStatus } from '@shared/types';
import { Result } from '@shared/utils';
import { ApiError } from '@shared/errors';

export class WebhookController implements IWebhookController {
  constructor(
    private stripeService: IStripeService,
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
    const eventResult = this.stripeService.verifyWebhookSignature(
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
        // This event is sent when a payment is authorized (manual capture)
        result = await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
        break;

      case 'payment_intent.succeeded':
        // This event is sent when a payment is captured or auto-captured
        result = await this.handlePaymentIntentSucceeded(
          event.data.object as Stripe.PaymentIntent
        );
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
      this.logger.error(
        `Webhook processing failed for ${event.type} (${event.id}): ${result.getError().message}`
      );
    }

    // Always return 200 to acknowledge receipt
    res.status(200).json({ received: true });
  }

  private async handlePaymentIntentSucceeded(
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
