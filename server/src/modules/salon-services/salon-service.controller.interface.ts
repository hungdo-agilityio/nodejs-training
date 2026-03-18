import { Request, Response } from 'express';

export interface ISalonServiceController {
  getServices(req: Request, res: Response): Promise<void>;
}
