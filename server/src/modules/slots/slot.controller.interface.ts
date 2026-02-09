import { Request, Response } from 'express';

export interface ISlotController {
  getAvailableSlots(req: Request, res: Response): Promise<void>;
}
