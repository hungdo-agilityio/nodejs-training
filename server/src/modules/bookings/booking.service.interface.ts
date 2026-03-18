import { Result } from '@shared/utils';
import { PaymentMethod, BookingStatus } from '@shared/types';
import { ApiError } from '@shared/errors';
import { Booking } from './entities/booking.entity';

export interface CreateBookingDTO {
  userId: string;
  serviceIds: string[];
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  paymentMethod: PaymentMethod;
  notes?: string;
  stripePaymentIntentId?: string;
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

export interface BookingDetail {
  id: string;
  services: Array<{
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
  }>;
  appointmentDatetime: string;
  appointmentDate: string;
  appointmentTime: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  totalDurationMinutes: number;
  notes: string | null;
  createdAt: string;
}

export interface CancelBookingResult {
  id: string;
  status: BookingStatus;
  previousStatus: BookingStatus;
  paymentMethod: PaymentMethod;
  cancelledAt: string;
  stripePaymentIntentId: string | null;
  totalPrice: number;
}

export interface DailyBookingItem {
  id: string;
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    phoneNumber: string | null;
  };
  services: Array<{
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
  }>;
  appointmentTime: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  totalPrice: number;
  totalDurationMinutes: number;
  notes: string | null;
}

export interface DailyBookingsSummary {
  totalBookings: number;
  totalRevenue: number;
  byStatus: Record<BookingStatus, number>;
}

export interface GetDailyBookingsResult {
  data: DailyBookingItem[];
  summary: DailyBookingsSummary;
  date: string;
}

export interface CheckInBookingResult {
  id: string;
  status: BookingStatus;
  checkedInAt: string;
}

export interface CompleteBookingResult {
  id: string;
  status: BookingStatus;
  completedAt: string;
}

export interface NoShowBookingResult {
  id: string;
  status: BookingStatus;
  previousStatus: BookingStatus;
  paymentMethod: PaymentMethod;
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

  /**
   * Get booking by ID
   */
  getBookingById(
    bookingId: string,
    userId: string
  ): Promise<Result<BookingDetail, ApiError>>;

  /**
   * Update booking with Stripe payment intent ID
   */
  updateBookingPaymentIntent(
    bookingId: string,
    paymentIntentId: string
  ): Promise<Result<void, ApiError>>;

  /**
   * Update booking status (used by webhooks)
   */
  updateBookingStatus(
    bookingId: string,
    status: BookingStatus
  ): Promise<Result<void, ApiError>>;

  /**
   * Get booking by Stripe payment intent ID (used by webhooks)
   */
  getBookingByPaymentIntentId(
    paymentIntentId: string
  ): Promise<Result<Booking, ApiError>>;

  /**
   * Cancel a booking
   */
  cancelBooking(
    bookingId: string,
    userId: string
  ): Promise<Result<CancelBookingResult, ApiError>>;

  /**
   * Get all bookings for a specific date (staff only)
   */
  getDailyBookings(
    date: string,
    excludeCompleted?: boolean
  ): Promise<Result<GetDailyBookingsResult, ApiError>>;

  /**
   * Check in a booking (staff only)
   */
  checkInBooking(
    bookingId: string
  ): Promise<Result<CheckInBookingResult, ApiError>>;

  /**
   * Complete a booking (staff only)
   */
  completeBooking(
    bookingId: string
  ): Promise<Result<CompleteBookingResult, ApiError>>;

  /**
   * Mark a booking as no-show (staff only)
   */
  noShowBooking(
    bookingId: string
  ): Promise<Result<NoShowBookingResult, ApiError>>;
}
