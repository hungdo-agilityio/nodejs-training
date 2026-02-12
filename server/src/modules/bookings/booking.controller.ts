import { Request, Response } from 'express';
import { IBookingController } from './booking.controller.interface';
import { BookingBusinessService } from './booking.service';
import { PaymentMethod, BookingStatus } from '@shared/types';
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

  async getBookings(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      const error = ApiError.unauthorized('Authentication required');
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    const {
      status,
      payment_method,
      service_id,
      date,
      start_date,
      end_date,
      sort_by,
      page,
      limit,
    } = req.query;

    // Validate status if provided
    if (status && typeof status === 'string') {
      const validStatuses = [
        'PENDING_PAYMENT',
        'CONFIRMED',
        'AUTHORIZED',
        'CHECKED_IN',
        'COMPLETED',
        'CANCELLED',
        'EXPIRED',
      ];
      if (!validStatuses.includes(status)) {
        const error = ApiError.validationError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        );
        res.status(error.statusCode).json(error.toJSON());
        return;
      }
    }

    // Validate payment_method if provided
    if (payment_method && typeof payment_method === 'string') {
      if (!['CASH', 'STRIPE'].includes(payment_method)) {
        const error = ApiError.validationError(
          'Invalid payment_method. Must be either CASH or STRIPE'
        );
        res.status(error.statusCode).json(error.toJSON());
        return;
      }
    }

    const result = await this.bookingService.getBookings({
      userId: req.user.id, // Users can only see their own bookings
      status: status as BookingStatus | undefined,
      paymentMethod: payment_method as PaymentMethod | undefined,
      serviceId: service_id as string | undefined,
      date: date as string | undefined,
      startDate: start_date as string | undefined,
      endDate: end_date as string | undefined,
      sortBy: sort_by as 'upcoming' | 'recent' | 'past' | undefined,
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
    });

    if (result.isErr()) {
      const error = result.getError();
      res.status(error.statusCode).json(error.toJSON());
      return;
    }

    res.json(result.getValue());
  }
}
