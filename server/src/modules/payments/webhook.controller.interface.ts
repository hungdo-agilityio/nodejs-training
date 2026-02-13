import { Request, Response } from 'express';

export interface IWebhookController {
  /**
   * Handle Stripe webhook events
   * POST /api/webhooks/stripe
   */
  handleStripeWebhook(req: Request, res: Response): Promise<void>;
}
