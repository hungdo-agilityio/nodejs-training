import { Result } from '@shared/utils';
import { PaymentMethod, BookingStatus } from '@shared/types';
import { ApiError } from '@shared/errors';

export interface CreateBookingDTO {
  userId: string;
  serviceIds: string[];
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface BookingValidationResult {
  totalPrice: number;
  totalDurationMinutes: number;
  services: Array<{
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
  }>;
}

export interface CreatedBookingResult {
  id: string;
  appointmentDate: string;
  appointmentDatetime: Date;
  totalPrice: number;
  totalDurationMinutes: number;
  status: BookingStatus;
  idempotencyKey: string;
}

export interface IBookingService {
  /**
   * Validate services and calculate totals
   */
  validateServicesAndCalculateTotals(
    serviceIds: string[]
  ): Promise<Result<BookingValidationResult, ApiError>>;

  /**
   * Check if the requested time slot has available capacity
   */
  checkCapacityAvailability(
    appointmentDate: string,
    appointmentTime: string,
    durationMinutes: number
  ): Promise<Result<boolean, ApiError>>;

  /**
   * Generate a unique idempotency key for the booking
   */
  generateIdempotencyKey(dto: CreateBookingDTO): string;

  /**
   * Create a new booking
   */
  createBooking(
    dto: CreateBookingDTO
  ): Promise<Result<CreatedBookingResult, ApiError>>;
}
