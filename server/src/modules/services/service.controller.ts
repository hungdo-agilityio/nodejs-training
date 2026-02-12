import { Request, Response } from 'express';
import { IServiceController } from './service.controller.interface';
import { IServiceService } from './service.service.interface';

export class ServiceController implements IServiceController {
  constructor(private serviceService: IServiceService) {}

  async getServices(req: Request, res: Response): Promise<void> {
    const result = await this.serviceService.getActiveServices();

    if (result.isErr()) {
      const error = result.getError();
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    res.json({ data: result.getValue() });
  }
}
