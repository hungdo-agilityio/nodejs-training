import { Request, Response } from 'express';

export interface IClerkWebhookHandler {
  handle(req: Request, res: Response): Promise<void>;
}
