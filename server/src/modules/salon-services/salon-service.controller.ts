import { Request, Response } from 'express';
import { ISalonServiceController } from './salon-service.controller.interface';
import { ISalonServiceService } from './salon-service.service.interface';

export class SalonServiceController implements ISalonServiceController {
  constructor(private serviceService: ISalonServiceService) {}

  async getServices(_req: Request, res: Response): Promise<void> {
    const result = await this.serviceService.getActiveServices();

    if (result.isErr()) {
      const error = result.getError();
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    res.json({ data: result.getValue() });
  }
}
