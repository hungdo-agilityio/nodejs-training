import { Router } from 'express';
import express from 'express';
import { IClerkWebhookHandler } from './webhooks/clerk-webhook.handler.interface';

export interface ClerkWebhookRouteDependencies {
  clerkWebhookHandler: IClerkWebhookHandler;
}

export const createClerkWebhookRoutes = (
  dependencies: ClerkWebhookRouteDependencies
): Router => {
  const router = Router();

  /**
   * @openapi
   * /webhooks/clerk:
   *   post:
   *     summary: Clerk webhook endpoint
   *     description: Handles user sync events from Clerk (user.created, user.updated, user.deleted)
   *     tags:
   *       - Webhooks
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *     responses:
   *       200:
   *         description: Webhook processed successfully
   *       400:
   *         description: Invalid webhook signature or missing headers
   *       500:
   *         description: Failed to process webhook
   */
  router.post('/', express.raw({ type: 'application/json' }), (req, res) =>
    dependencies.clerkWebhookHandler.handle(req, res)
  );

  return router;
};
