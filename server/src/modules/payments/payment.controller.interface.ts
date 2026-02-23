import { Request, Response } from 'express';

export interface IPaymentController {
  /**
   * Authorize payment for a booking
   * POST /api/payments/authorize
   */
  authorizePayment(req: Request, res: Response): Promise<void>;

  /**
   * Create a payment intent before booking (for card flow)
   * POST /api/payments/create-intent
   */
  createPaymentIntent(req: Request, res: Response): Promise<void>;
}
