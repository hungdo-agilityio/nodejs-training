import { Request, Response } from 'express';
import { IServiceController } from './service.controller.interface';
import { IServiceService } from './service.service.interface';

export class ServiceController implements IServiceController {
  constructor(private serviceService: IServiceService) {}

  async getServices(req: Request, res: Response): Promise<void> {
    const result = await this.serviceService.getActiveServices();

    if (result.isErr()) {
      res.status(500).json({
        error: {
          code: 'SERVICE_ERROR',
          message: result.getError(),
        },
      });
      return;
    }

    res.json({ data: result.getValue() });
  }
}
