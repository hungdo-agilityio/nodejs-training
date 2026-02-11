import { Request, Response } from 'express';
import { IBookingController } from './booking.controller.interface';
import { BookingBusinessService } from './booking.service';
import { PaymentMethod } from '@shared/types';

export class BookingController implements IBookingController {
  constructor(private bookingService: BookingBusinessService) {}

  async createBooking(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { serviceIds, appointmentDate, appointmentTime, paymentMethod, notes } = req.body;

    // Validate required fields
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      res.status(400).json({ error: 'serviceIds is required and must be a non-empty array' });
      return;
    }

    if (!appointmentDate) {
      res.status(400).json({ error: 'appointmentDate is required' });
      return;
    }

    if (!appointmentTime) {
      res.status(400).json({ error: 'appointmentTime is required' });
      return;
    }

    if (!paymentMethod) {
      res.status(400).json({ error: 'paymentMethod is required' });
      return;
    }

    if (!['CASH', 'STRIPE'].includes(paymentMethod)) {
      res.status(400).json({ error: 'paymentMethod must be either CASH or STRIPE' });
      return;
    }

    const result = await this.bookingService.createBooking({
      userId: req.user.id,
      serviceIds,
      appointmentDate,
      appointmentTime,
      paymentMethod: paymentMethod as PaymentMethod,
      notes,
    });

    if (result.isErr()) {
      res.status(400).json({ error: result.getError() });
      return;
    }

    const booking = result.getValue();
    res.status(201).json({ data: booking });
  }
}
