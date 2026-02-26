import { BookingStatus, PaymentMethod } from '@shared/types';
import { Booking } from './entities/booking.entity';
import { GetBookingsFilters } from './booking.service.interface';

interface CreateBookingService {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface CreateBookingParams {
  userId: string;
  appointmentDate: string;
  appointmentDatetime: Date;
  appointmentTime: string;
  totalDurationMinutes: number;
  totalPrice: number;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  currency: string;
  idempotencyKey: string;
  notes: string | null;
  stripePaymentIntentId: string | null;
  services: CreateBookingService[];
}

export class BookingCapacityError extends Error {
  constructor(message = 'No capacity available for the requested time slot') {
    super(message);
    this.name = 'BookingCapacityError';
  }
}

export class BookingDuplicateError extends Error {
  constructor(message = 'Booking already exists') {
    super(message);
    this.name = 'BookingDuplicateError';
  }
}

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByIdWithServices(id: string): Promise<Booking | null>;
  findByPaymentIntentId(paymentIntentId: string): Promise<Booking | null>;
  findByIdempotencyKey(key: string): Promise<Booking | null>;
  findActiveByDate(
    date: string,
    statuses: BookingStatus[]
  ): Promise<Pick<Booking, 'appointmentDatetime' | 'totalDurationMinutes'>[]>;
  findWithFilters(
    filters: GetBookingsFilters
  ): Promise<{ data: (Booking & { servicesCount?: number })[]; total: number }>;
  findDailyWithDetails(
    date: string,
    excludeStatuses?: BookingStatus[]
  ): Promise<Booking[]>;
  updateById(id: string, data: Partial<Booking>): Promise<boolean>;
  createBookingWithServices(params: CreateBookingParams): Promise<Booking>;
}
