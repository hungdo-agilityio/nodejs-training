import { Request, Response } from 'express';
import { ISlotService } from './slot.service.interface';
import { ISlotController } from './slot.controller.interface';
import { ApiError } from '@shared/errors';

export class SlotController implements ISlotController {
  constructor(private slotService: ISlotService) {}

  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    const { date, service_ids } = req.query;

    if (!date || typeof date !== 'string') {
      const error = ApiError.validationError(
        'Date query parameter is required (YYYY-MM-DD)'
      );
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    // Parse service_ids if provided
    let serviceIds: string[] | undefined;
    if (service_ids && typeof service_ids === 'string') {
      serviceIds = service_ids.split(',').map((id) => id.trim());
    }

    const result = await this.slotService.getAvailableSlots({
      date,
      serviceIds,
    });

    if (result.isErr()) {
      const error = result.getError();
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    res.json({ data: result.getValue() });
  }
}
