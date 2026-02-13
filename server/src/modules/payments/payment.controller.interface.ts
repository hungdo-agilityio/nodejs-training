import { Request, Response } from 'express';

export interface IPaymentController {
  /**
   * Authorize payment for a booking
   * POST /api/payments/authorize
   */
  authorizePayment(req: Request, res: Response): Promise<void>;
}
