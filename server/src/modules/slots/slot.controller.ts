import { Request, Response } from 'express';
import { ISlotService } from './slot.service.interface';
import { ISlotController } from './slot.controller.interface';
import { SlotValidator } from './slot.validator';

export class SlotController implements ISlotController {
  constructor(private slotService: ISlotService) {}

  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    const { date, service_ids } = req.query;

    const validation = SlotValidator.validateGetSlots(
      req.query as Record<string, unknown>
    );

    if (!validation.valid) {
      res.status(validation.error.statusCode).json(validation.error.toJSON());
      return;
    }

    // Parse service_ids if provided
    let serviceIds: string[] | undefined;
    if (service_ids && typeof service_ids === 'string') {
      serviceIds = service_ids.split(',').map((id) => id.trim());
    }

    const result = await this.slotService.getAvailableSlots({
      date: date as string,
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
