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

export interface GetBookingsFilters {
  userId?: string;
  status?: BookingStatus;
  paymentMethod?: PaymentMethod;
  serviceId?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'upcoming' | 'recent' | 'past';
  page?: number;
  limit?: number;
}

export interface BookingListItem {
  id: string;
  servicesCount: number;
  appointmentDatetime: string;
  appointmentDate: string;
  appointmentTime: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  totalDurationMinutes: number;
  createdAt: string;
}

export interface GetBookingsResult {
  data: BookingListItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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

  /**
   * Get bookings with filters
   */
  getBookings(
    filters: GetBookingsFilters
  ): Promise<Result<GetBookingsResult, ApiError>>;
}
