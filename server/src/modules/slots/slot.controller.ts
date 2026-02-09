import { Request, Response } from 'express';
import { ISlotService } from './slot.service.interface';
import { ISlotController } from './slot.controller.interface';

export class SlotController implements ISlotController {
  constructor(private slotService: ISlotService) {}

  async getAvailableSlots(req: Request, res: Response): Promise<void> {
    const { date, service_ids } = req.query;

    if (!date || typeof date !== 'string') {
      res.status(400).json({
        error: {
          code: 'INVALID_REQUEST',
          message: 'Date query parameter is required (YYYY-MM-DD)',
        },
      });
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
      res.status(400).json({
        error: {
          code: 'SLOT_ERROR',
          message: result.getError(),
        },
      });
      return;
    }

    res.json({ data: result.getValue() });
  }
}
