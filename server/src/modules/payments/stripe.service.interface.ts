import Stripe from 'stripe';
import { Result } from '@shared/utils';
import { ApiError } from '@shared/errors';

export interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  bookingId?: string;
  userId: string;
  idempotencyKey: string; // From client to prevent duplicate charges
  serviceIds?: string[];
  appointmentDate?: string;
  appointmentTime?: string;
}

export interface IStripeService {
  /**
   * Create a PaymentIntent with manual capture for authorization
   */
  createPaymentIntent(
    params: CreatePaymentIntentParams
  ): Promise<Result<Stripe.PaymentIntent, ApiError>>;

  /**
   * Capture an authorized payment (on check-in)
   */
  capturePayment(
    paymentIntentId: string,
    amountToCapture?: number
  ): Promise<Result<Stripe.PaymentIntent, ApiError>>;

  /**
   * Cancel an uncaptured PaymentIntent (releases the hold)
   */
  cancelPaymentIntent(
    paymentIntentId: string
  ): Promise<Result<Stripe.PaymentIntent, ApiError>>;

  /**
   * Create a refund for a captured payment
   */
  createRefund(
    paymentIntentId: string,
    amount?: number
  ): Promise<Result<Stripe.Refund, ApiError>>;

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): Result<Stripe.Event, ApiError>;
}
