import { Request, Response } from 'express';

export interface IServiceController {
  getServices(req: Request, res: Response): Promise<void>;
}
