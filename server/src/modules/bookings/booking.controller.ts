import { Request, Response } from 'express';
import { IBookingController } from './booking.controller.interface';
import { BookingBusinessService } from './booking.service';
import { PaymentMethod } from '@shared/types';
import { ApiError } from '@shared/errors';

export class BookingController implements IBookingController {
  constructor(private bookingService: BookingBusinessService) {}

  async createBooking(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      const error = ApiError.unauthorized('Authentication required');
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    const {
      serviceIds,
      appointmentDate,
      appointmentTime,
      paymentMethod,
      notes,
    } = req.body;

    // Validate required fields
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      const error = ApiError.validationError(
        'serviceIds is required and must be a non-empty array'
      );
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    if (!appointmentDate) {
      const error = ApiError.validationError(
        'appointmentDate is required'
      );
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    if (!appointmentTime) {
      const error = ApiError.validationError(
        'appointmentTime is required'
      );
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    if (!paymentMethod) {
      const error = ApiError.validationError('paymentMethod is required');
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    if (!['CASH', 'STRIPE'].includes(paymentMethod)) {
      const error = ApiError.validationError(
        'paymentMethod must be either CASH or STRIPE'
      );
      res.status(error.statusCode).json(error.toJSON());
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
      const error = result.getError();
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    const booking = result.getValue();
    res.status(201).json({ data: booking });
  }
}
