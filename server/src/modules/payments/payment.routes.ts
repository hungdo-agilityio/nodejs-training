import { Router } from 'express';
import express from 'express';
import { IPaymentController } from './payment.controller.interface';
import { IWebhookController } from './webhook.controller.interface';

export function createPaymentRoutes(controller: IPaymentController): Router {
  const router = Router();
  router.post('/authorize', (req, res) =>
    controller.authorizePayment(req, res)
  );
  return router;
}

export function createWebhookRoutes(controller: IWebhookController): Router {
  const router = Router();

  router.post(
    '/stripe',
    express.raw({ type: 'application/json' }),
    (req, res) => controller.handleStripeWebhook(req, res)
  );

  return router;
}
