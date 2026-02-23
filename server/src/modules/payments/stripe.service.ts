import Stripe from 'stripe';
import { ILogger } from '@shared/types';
import { Result } from '@shared/utils';
import { ApiError } from '@shared/errors';
import { STRIPE_WEBHOOK_SECRET } from '@shared/constants';
import {
  IStripeService,
  CreatePaymentIntentParams,
} from './stripe.service.interface';

export class StripeService implements IStripeService {
  constructor(
    private stripe: Stripe,
    private logger: ILogger
  ) {}

  async createPaymentIntent(
    params: CreatePaymentIntentParams
  ): Promise<Result<Stripe.PaymentIntent, ApiError>> {
    try {
      const {
        amount,
        currency,
        bookingId,
        userId,
        idempotencyKey,
        serviceIds,
        appointmentDate,
        appointmentTime,
      } = params;

      // Build metadata
      const metadata: Record<string, string> = { userId };
      if (bookingId) metadata.bookingId = bookingId;
      if (serviceIds) metadata.serviceIds = JSON.stringify(serviceIds);
      if (appointmentDate) metadata.appointmentDate = appointmentDate;
      if (appointmentTime) metadata.appointmentTime = appointmentTime;

      // Create PaymentIntent with manual capture
      const paymentIntent = await this.stripe.paymentIntents.create(
        {
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          capture_method: 'manual', // Authorize now, capture on check-in
          metadata,
        },
        {
          // Use client-provided idempotency key to prevent duplicate charges
          idempotencyKey,
        }
      );

      return Result.ok(paymentIntent);
    } catch (error) {
      this.logger.error('Failed to create PaymentIntent', error as Error);

      if (error instanceof Stripe.errors.StripeError) {
        return Result.err(
          ApiError.internalError(`Stripe error: ${error.message}`)
        );
      }

      return Result.err(
        ApiError.internalError('Failed to create payment intent')
      );
    }
  }

  async capturePayment(
    paymentIntentId: string,
    amountToCapture?: number
  ): Promise<Result<Stripe.PaymentIntent, ApiError>> {
    try {
      const captureParams: Stripe.PaymentIntentCaptureParams = {};

      if (amountToCapture !== undefined) {
        captureParams.amount_to_capture = Math.round(amountToCapture * 100);
      }

      const paymentIntent = await this.stripe.paymentIntents.capture(
        paymentIntentId,
        captureParams
      );

      return Result.ok(paymentIntent);
    } catch (error) {
      this.logger.error('Failed to capture payment', error as Error);

      if (error instanceof Stripe.errors.StripeError) {
        return Result.err(
          ApiError.internalError(`Stripe error: ${error.message}`)
        );
      }

      return Result.err(ApiError.internalError('Failed to capture payment'));
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number
  ): Promise<Result<Stripe.Refund, ApiError>> {
    try {
      const refundParams: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount !== undefined) {
        refundParams.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return Result.ok(refund);
    } catch (error) {
      this.logger.error('Failed to create refund', error as Error);

      if (error instanceof Stripe.errors.StripeError) {
        return Result.err(
          ApiError.internalError(`Stripe error: ${error.message}`)
        );
      }

      return Result.err(ApiError.internalError('Failed to create refund'));
    }
  }

  verifyWebhookSignature(
    payload: string,
    signature: string
  ): Result<Stripe.Event, ApiError> {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        STRIPE_WEBHOOK_SECRET
      );

      return Result.ok(event);
    } catch (error) {
      this.logger.error(
        'Webhook signature verification failed',
        error as Error
      );
      return Result.err(ApiError.unauthorized('Invalid webhook signature'));
    }
  }
}
