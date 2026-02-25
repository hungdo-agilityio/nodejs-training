import { Router } from 'express';
import express from 'express';
import { IPaymentController } from './payment.controller.interface';
import { IWebhookController } from './webhook.controller.interface';

export function createPaymentRoutes(controller: IPaymentController): Router {
  const router = Router();

  /**
   * @openapi
   * /payments/create-intent:
   *   post:
   *     summary: Create Stripe PaymentIntent
   *     description: |
   *       Creates a Stripe PaymentIntent before booking. Validates services and checks capacity,
   *       then returns a client_secret for use with Stripe Elements on the frontend.
   *       The returned paymentIntentId must be passed to POST /bookings to link payment with booking.
   *     tags:
   *       - Payments
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - serviceIds
   *               - appointmentDate
   *               - appointmentTime
   *             properties:
   *               serviceIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *                 description: Array of service IDs to book
   *                 example: ["service-uuid-1", "service-uuid-2"]
   *               appointmentDate:
   *                 type: string
   *                 format: date
   *                 description: Appointment date (YYYY-MM-DD)
   *                 example: "2026-02-15"
   *               appointmentTime:
   *                 type: string
   *                 description: Appointment time in HH:MM format (24-hour)
   *                 example: "14:30"
   *     responses:
   *       200:
   *         description: PaymentIntent created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     clientSecret:
   *                       type: string
   *                       description: Stripe client secret for confirmCardPayment()
   *                     paymentIntentId:
   *                       type: string
   *                       description: Stripe PaymentIntent ID — pass to POST /bookings as stripePaymentIntentId
   *                     amount:
   *                       type: number
   *                       description: Total amount in USD
   *                     currency:
   *                       type: string
   *                       example: "usd"
   *       400:
   *         description: Validation error or no capacity available
   *       401:
   *         description: Unauthorized - authentication required
   */
  router.post('/create-intent', (req, res) =>
    controller.createPaymentIntent(req, res)
  );

  /**
   * @openapi
   * /payments/authorize:
   *   post:
   *     summary: Authorize payment for an existing booking
   *     description: |
   *       Creates a Stripe PaymentIntent for a booking that is already in PENDING_PAYMENT status.
   *       Returns a client_secret for use with Stripe Elements to confirm the payment.
   *       This is the legacy flow — prefer POST /payments/create-intent for new integrations.
   *     tags:
   *       - Payments
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - bookingId
   *               - idempotencyKey
   *             properties:
   *               bookingId:
   *                 type: string
   *                 format: uuid
   *                 description: ID of the booking to authorize payment for
   *               idempotencyKey:
   *                 type: string
   *                 description: Idempotency key from the booking (prevents duplicate payment intents)
   *     responses:
   *       200:
   *         description: Payment authorization created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: object
   *                   properties:
   *                     clientSecret:
   *                       type: string
   *                       description: Stripe client secret for confirmCardPayment()
   *                     amount:
   *                       type: number
   *                       description: Total amount in USD
   *                     currency:
   *                       type: string
   *                       example: "usd"
   *       400:
   *         description: Booking is not in PENDING_PAYMENT status
   *       401:
   *         description: Unauthorized - authentication required
   *       404:
   *         description: Booking not found
   */
  router.post('/authorize', (req, res) =>
    controller.authorizePayment(req, res)
  );

  return router;
}

export function createWebhookRoutes(controller: IWebhookController): Router {
  const router = Router();

  /**
   * @openapi
   * /webhooks/stripe:
   *   post:
   *     summary: Stripe webhook handler
   *     description: |
   *       Receives and processes Stripe webhook events. Signature is verified using STRIPE_WEBHOOK_SECRET.
   *
   *       Handled events:
   *       - `payment_intent.succeeded` → updates booking status to AUTHORIZED
   *       - `payment_intent.payment_failed` → updates booking status to PAYMENT_FAILED
   *       - `charge.refunded` → updates booking status to CANCELLED
   *     tags:
   *       - Payments
   *     parameters:
   *       - in: header
   *         name: stripe-signature
   *         required: true
   *         schema:
   *           type: string
   *         description: Stripe webhook signature for request verification
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             description: Raw Stripe event payload
   *     responses:
   *       200:
   *         description: Webhook received and processed
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 received:
   *                   type: boolean
   *                   example: true
   *       400:
   *         description: Invalid signature or unrecognized event
   */
  router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    (req, res) => controller.handleStripeWebhook(req, res)
  );

  return router;
}
