import { createHash } from 'crypto';
import { ILogger, BookingStatus, PaymentMethod } from '@shared/types';
import { Result } from '@shared/utils';
import { DEFAULT_CAPACITY } from '@shared/constants';
import { ApiError } from '@shared/errors';
import { IServiceRepository } from '@modules/services';
import { IStripeService } from '@modules/payments';
import { Booking } from './entities/booking.entity';
import { BookingValidator } from './booking.validator';
import {
  IBookingService,
  CreateBookingDTO,
  BookingValidationResult,
  CreatedBookingResult,
  GetBookingsFilters,
  GetBookingsResult,
  BookingListItem,
  BookingDetail,
  CancelBookingResult,
  GetDailyBookingsResult,
  DailyBookingItem,
  DailyBookingsSummary,
  CheckInBookingResult,
  CompleteBookingResult,
  NoShowBookingResult,
} from './booking.service.interface';
import {
  IBookingRepository,
  BookingCapacityError,
  BookingDuplicateError,
} from './booking.repository.interface';

/**
 * BookingBusinessService handles all booking-related business logic
 *
 * Concurrency Protection:
 * 1. Database-level unique constraint on idempotency_key prevents duplicate bookings
 * 2. Idempotency key is deterministic (same input = same key)
 * 3. Race conditions are caught and handled gracefully
 * 4. Capacity checks ensure slots aren't overbooked
 */
export class BookingBusinessService implements IBookingService {
  constructor(
    private bookingRepository: IBookingRepository,
    private serviceRepository: IServiceRepository,
    private stripeService: IStripeService,
    private logger: ILogger
  ) {}

  /**
   * Validate services exist, are active, and calculate total price and duration
   */
  async validateServicesAndCalculateTotals(
    serviceIds: string[]
  ): Promise<Result<BookingValidationResult, ApiError>> {
    try {
      // Validate input
      if (!serviceIds || serviceIds.length === 0) {
        return Result.err(
          ApiError.validationError('At least one service must be selected')
        );
      }

      // Remove duplicates
      const uniqueServiceIds = [...new Set(serviceIds)];

      // Fetch services from database
      const services =
        await this.serviceRepository.findActiveByIds(uniqueServiceIds);

      // Check if all services were found
      if (services.length !== uniqueServiceIds.length) {
        return Result.err(
          ApiError.notFound('One or more services not found or inactive')
        );
      }

      // Calculate totals
      const totalPrice = services.reduce(
        (sum, service) => sum + service.price,
        0
      );
      const totalDurationMinutes = services.reduce(
        (sum, service) => sum + service.durationMinutes,
        0
      );

      // Map services to response format
      const servicesData = services.map((service) => ({
        id: service.id,
        name: service.name,
        price: service.price,
        durationMinutes: service.durationMinutes,
      }));

      return Result.ok({
        totalPrice,
        totalDurationMinutes,
        services: servicesData,
      });
    } catch (error) {
      this.logger.error('Failed to validate services', error as Error);
      return Result.err(ApiError.internalError('Failed to validate services'));
    }
  }

  /**
   * Check if the requested time slot has available capacity
   */
  async checkCapacityAvailability(
    appointmentDate: string,
    appointmentTime: string,
    durationMinutes: number
  ): Promise<Result<boolean, ApiError>> {
    try {
      const dtValidation = BookingValidator.validateDateTimeParams(
        appointmentDate,
        appointmentTime
      );
      if (!dtValidation.valid) {
        return Result.err(dtValidation.error);
      }

      // Parse time
      const [hour, minute] = appointmentTime.split(':').map(Number);
      const slotStartMinutes = hour * 60 + minute;
      const slotEndMinutes = slotStartMinutes + durationMinutes;

      // Get existing bookings for this date
      const activeStatuses = [
        BookingStatus.PENDING_PAYMENT,
        BookingStatus.AUTHORIZED,
        BookingStatus.CONFIRMED,
        BookingStatus.CHECKED_IN,
      ];
      const bookings = await this.bookingRepository.findActiveByDate(
        appointmentDate,
        activeStatuses
      );

      // Calculate how many bookings overlap with requested slot
      let occupiedCount = 0;

      for (const booking of bookings) {
        const bookingDate = new Date(booking.appointmentDatetime);
        const bookingStartMinutes =
          bookingDate.getHours() * 60 + bookingDate.getMinutes();
        const bookingEndMinutes =
          bookingStartMinutes + booking.totalDurationMinutes;

        // Check if booking overlaps with requested slot
        if (
          bookingStartMinutes < slotEndMinutes &&
          bookingEndMinutes > slotStartMinutes
        ) {
          occupiedCount++;
        }
      }

      // Check if capacity is available
      const isAvailable = occupiedCount < DEFAULT_CAPACITY;

      if (!isAvailable) {
        return Result.err(
          ApiError.conflict('No capacity available for the requested time slot')
        );
      }

      return Result.ok(true);
    } catch (error) {
      this.logger.error(
        'Failed to check capacity availability',
        error as Error
      );
      return Result.err(
        ApiError.internalError('Failed to check capacity availability')
      );
    }
  }

  /**
   * Generate a unique idempotency key for the booking
   * This prevents duplicate bookings if the request is retried
   */
  generateIdempotencyKey(dto: CreateBookingDTO): string {
    // Create a deterministic hash based on booking details
    const data = JSON.stringify({
      userId: dto.userId,
      serviceIds: dto.serviceIds.sort(), // Sort to ensure consistent ordering
      appointmentDate: dto.appointmentDate,
      appointmentTime: dto.appointmentTime,
      timestamp: new Date().toISOString().split('T')[0], // Date only, allows same user to book same services on different days
    });

    const hash = createHash('sha256').update(data).digest('hex');
    return `booking_${hash.substring(0, 32)}`;
  }

  /**
   * Create a new booking.
   *
   * The capacity re-check, booking row, and booking_services rows are all
   * written inside a single transaction so they succeed or fail atomically.
   * This prevents overbooking under concurrency and ensures a booking is never
   * persisted without its associated service rows.
   */
  async createBooking(
    dto: CreateBookingDTO
  ): Promise<Result<CreatedBookingResult, ApiError>> {
    try {
      // 1. Validate services and calculate totals (read-only, outside tx)
      const validationResult = await this.validateServicesAndCalculateTotals(
        dto.serviceIds
      );

      if (validationResult.isErr()) {
        return Result.err(validationResult.getError());
      }

      const { totalPrice, totalDurationMinutes, services } =
        validationResult.getValue();

      // 2. Validate date/time format and reject past slots (pure checks, outside tx)
      const capacityResult = await this.checkCapacityAvailability(
        dto.appointmentDate,
        dto.appointmentTime,
        totalDurationMinutes
      );

      if (capacityResult.isErr()) {
        return Result.err(capacityResult.getError());
      }

      // 3. Generate idempotency key
      const idempotencyKey = this.generateIdempotencyKey(dto);

      // 4. Determine booking status
      const isCashPayment = dto.paymentMethod === PaymentMethod.CASH;
      const hasPaymentIntent = !!dto.stripePaymentIntentId;
      let status: BookingStatus;

      if (isCashPayment) {
        status = BookingStatus.CONFIRMED;
      } else if (hasPaymentIntent) {
        status = BookingStatus.AUTHORIZED;
      } else {
        status = BookingStatus.PENDING_PAYMENT;
      }

      const appointmentDatetime = new Date(
        `${dto.appointmentDate}T${dto.appointmentTime}:00`
      );

      // 5. Capacity re-check + all writes in one atomic transaction
      const savedBooking =
        await this.bookingRepository.createBookingWithServices({
          userId: dto.userId,
          appointmentDate: dto.appointmentDate,
          appointmentDatetime,
          appointmentTime: dto.appointmentTime,
          totalDurationMinutes,
          totalPrice,
          paymentMethod: dto.paymentMethod,
          status,
          currency: 'USD',
          idempotencyKey,
          notes: dto.notes || null,
          stripePaymentIntentId: dto.stripePaymentIntentId || null,
          services,
        });

      const appointmentTime = new Date(savedBooking.appointmentDatetime)
        .toTimeString()
        .substring(0, 5);

      return Result.ok({
        id: savedBooking.id,
        appointmentDate: savedBooking.appointmentDate,
        appointmentDatetime: savedBooking.appointmentDatetime,
        appointmentTime,
        totalPrice: savedBooking.totalPrice,
        totalDurationMinutes: savedBooking.totalDurationMinutes,
        status: savedBooking.status,
        idempotencyKey: savedBooking.idempotencyKey,
      });
    } catch (error) {
      if (error instanceof BookingCapacityError) {
        return Result.err(
          ApiError.conflict('No capacity available for the requested time slot')
        );
      }

      if (error instanceof BookingDuplicateError) {
        return Result.err(ApiError.conflict('Booking already exists'));
      }

      return Result.err(ApiError.internalError('Failed to create booking'));
    }
  }

  /**
   * Get bookings with filters and pagination
   */
  async getBookings(
    filters: GetBookingsFilters
  ): Promise<Result<GetBookingsResult, ApiError>> {
    try {
      const { page = 1, limit = 100 } = filters;
      const { data: bookings, total } =
        await this.bookingRepository.findWithFilters(filters);

      // Format response
      const data: BookingListItem[] = bookings.map((booking) => {
        const appointmentTime = new Date(booking.appointmentDatetime)
          .toTimeString()
          .substring(0, 5);

        return {
          id: booking.id,
          servicesCount: booking.servicesCount || 0,
          appointmentDatetime: booking.appointmentDatetime.toISOString(),
          appointmentDate: booking.appointmentDate,
          appointmentTime,
          status: booking.status,
          paymentMethod: booking.paymentMethod,
          totalPrice: booking.totalPrice,
          totalDurationMinutes: booking.totalDurationMinutes,
          createdAt: booking.createdAt.toISOString(),
        };
      });

      return Result.ok({
        data,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      this.logger.error('Failed to get bookings', error as Error);
      return Result.err(ApiError.internalError('Failed to retrieve bookings'));
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(
    bookingId: string,
    userId: string
  ): Promise<Result<BookingDetail, ApiError>> {
    try {
      const booking =
        await this.bookingRepository.findByIdWithServices(bookingId);

      if (!booking) {
        return Result.err(ApiError.notFound('Booking not found'));
      }

      // Check if user owns this booking
      if (booking.userId !== userId) {
        return Result.err(
          ApiError.forbidden('You do not have access to this booking')
        );
      }

      const appointmentTime = new Date(booking.appointmentDatetime)
        .toTimeString()
        .substring(0, 5);

      const bookingDetail: BookingDetail = {
        id: booking.id,
        services: booking.bookingServices.map((bs) => ({
          id: bs.serviceId,
          name: bs.serviceName,
          price: bs.servicePrice,
          durationMinutes: bs.serviceDurationMinutes,
        })),
        appointmentDatetime: booking.appointmentDatetime.toISOString(),
        appointmentDate: booking.appointmentDate,
        appointmentTime,
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        totalPrice: booking.totalPrice,
        totalDurationMinutes: booking.totalDurationMinutes,
        notes: booking.notes,
        createdAt: booking.createdAt.toISOString(),
      };

      return Result.ok(bookingDetail);
    } catch (error) {
      this.logger.error('Failed to get booking by ID', error as Error);
      return Result.err(ApiError.internalError('Failed to retrieve booking'));
    }
  }

  /**
   * Update booking with Stripe payment intent ID
   */
  async updateBookingPaymentIntent(
    bookingId: string,
    paymentIntentId: string
  ): Promise<Result<void, ApiError>> {
    try {
      const updated = await this.bookingRepository.updateById(bookingId, {
        stripePaymentIntentId: paymentIntentId,
      });

      if (!updated) {
        return Result.err(ApiError.notFound('Booking not found'));
      }

      return Result.ok(undefined);
    } catch (error) {
      this.logger.error(
        'Failed to update booking payment intent',
        error as Error
      );
      return Result.err(
        ApiError.internalError('Failed to update booking payment intent')
      );
    }
  }

  /**
   * Update booking status (used by webhooks)
   */
  async updateBookingStatus(
    bookingId: string,
    status: BookingStatus
  ): Promise<Result<void, ApiError>> {
    try {
      const updated = await this.bookingRepository.updateById(bookingId, {
        status,
      });

      if (!updated) {
        return Result.err(ApiError.notFound('Booking not found'));
      }

      return Result.ok(undefined);
    } catch (error) {
      this.logger.error('Failed to update booking status', error as Error);
      return Result.err(
        ApiError.internalError('Failed to update booking status')
      );
    }
  }

  /**
   * Get booking by Stripe payment intent ID (used by webhooks)
   */
  async getBookingByPaymentIntentId(
    paymentIntentId: string
  ): Promise<Result<Booking, ApiError>> {
    try {
      const booking =
        await this.bookingRepository.findByPaymentIntentId(paymentIntentId);

      if (!booking) {
        return Result.err(
          ApiError.notFound('Booking not found for this payment intent')
        );
      }

      return Result.ok(booking);
    } catch (error) {
      this.logger.error(
        'Failed to get booking by payment intent ID',
        error as Error
      );
      return Result.err(
        ApiError.internalError('Failed to retrieve booking by payment intent')
      );
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    userId: string
  ): Promise<Result<CancelBookingResult, ApiError>> {
    try {
      const booking = await this.bookingRepository.findById(bookingId);

      if (!booking) {
        return Result.err(ApiError.notFound('Booking not found'));
      }

      if (booking.userId !== userId) {
        return Result.err(
          ApiError.forbidden('You do not have access to this booking')
        );
      }

      const cancelValidation = BookingValidator.validateCancel(booking);
      if (!cancelValidation.valid) {
        return Result.err(cancelValidation.error);
      }

      const cancelledAt = new Date();
      await this.bookingRepository.updateById(bookingId, {
        status: BookingStatus.CANCELLED,
        cancelledAt,
      });

      return Result.ok({
        id: booking.id,
        status: BookingStatus.CANCELLED,
        previousStatus: booking.status,
        paymentMethod: booking.paymentMethod,
        cancelledAt: cancelledAt.toISOString(),
        stripePaymentIntentId: booking.stripePaymentIntentId,
        totalPrice: booking.totalPrice,
      });
    } catch (error) {
      this.logger.error('Failed to cancel booking', error as Error);
      return Result.err(ApiError.internalError('Failed to cancel booking'));
    }
  }

  /**
   * Get all bookings for a specific date (staff only)
   */
  async getDailyBookings(
    date: string,
    excludeCompleted = false
  ): Promise<Result<GetDailyBookingsResult, ApiError>> {
    try {
      const dateValidation = BookingValidator.validateDateParam(date);
      if (!dateValidation.valid) {
        return Result.err(dateValidation.error);
      }

      const excludeStatuses = excludeCompleted
        ? [BookingStatus.DONE, BookingStatus.CANCELLED, BookingStatus.NO_SHOW]
        : undefined;

      const bookings = await this.bookingRepository.findDailyWithDetails(
        date,
        excludeStatuses
      );

      // Calculate summary statistics
      const summary: DailyBookingsSummary = {
        totalBookings: bookings.length,
        totalRevenue: 0,
        byStatus: {} as Record<BookingStatus, number>,
      };

      // Initialize status counts
      Object.values(BookingStatus).forEach((status) => {
        summary.byStatus[status] = 0;
      });

      // Format bookings and calculate summary
      const data: DailyBookingItem[] = bookings.map((booking) => {
        const appointmentTime = new Date(booking.appointmentDatetime)
          .toTimeString()
          .substring(0, 5);

        // Update summary
        summary.byStatus[booking.status]++;
        if (
          booking.status === BookingStatus.CONFIRMED ||
          booking.status === BookingStatus.CHECKED_IN ||
          booking.status === BookingStatus.DONE
        ) {
          summary.totalRevenue += booking.totalPrice;
        }

        return {
          id: booking.id,
          customer: {
            id: booking.user.id,
            firstName: booking.user.firstName,
            lastName: booking.user.lastName,
            email: booking.user.email,
            phoneNumber: booking.user.phone,
          },
          services: booking.bookingServices.map((bs) => ({
            id: bs.serviceId,
            name: bs.serviceName,
            price: bs.servicePrice,
            durationMinutes: bs.serviceDurationMinutes,
          })),
          appointmentTime,
          status: booking.status,
          paymentMethod: booking.paymentMethod,
          totalPrice: booking.totalPrice,
          totalDurationMinutes: booking.totalDurationMinutes,
          notes: booking.notes,
        };
      });

      return Result.ok({
        data,
        summary,
        date,
      });
    } catch (error) {
      this.logger.error('Failed to get daily bookings', error as Error);
      return Result.err(
        ApiError.internalError('Failed to retrieve daily bookings')
      );
    }
  }

  /**
   * Check in a booking (staff only)
   */
  async checkInBooking(
    bookingId: string
  ): Promise<Result<CheckInBookingResult, ApiError>> {
    try {
      // Get booking
      const booking = await this.bookingRepository.findById(bookingId);

      if (!booking) {
        return Result.err(ApiError.notFound('Booking not found'));
      }

      const checkInValidation = BookingValidator.validateCheckIn(booking);
      if (!checkInValidation.valid) {
        return Result.err(checkInValidation.error);
      }

      // For Stripe payments, capture the payment
      if (
        booking.paymentMethod === PaymentMethod.STRIPE &&
        booking.stripePaymentIntentId
      ) {
        const captureResult = await this.stripeService.capturePayment(
          booking.stripePaymentIntentId
        );

        if (captureResult.isErr()) {
          return Result.err(
            ApiError.internalError(
              'Failed to capture payment. Check-in cancelled.'
            )
          );
        }
      }

      // Update booking status to CHECKED_IN
      const checkedInAt = new Date();
      await this.bookingRepository.updateById(bookingId, {
        status: BookingStatus.CHECKED_IN,
        checkedInAt,
      });

      return Result.ok({
        id: booking.id,
        status: BookingStatus.CHECKED_IN,
        checkedInAt: checkedInAt.toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to check in booking', error as Error);
      return Result.err(ApiError.internalError('Failed to check in booking'));
    }
  }

  /**
   * Complete a booking (staff only)
   */
  async completeBooking(
    bookingId: string
  ): Promise<Result<CompleteBookingResult, ApiError>> {
    try {
      // Get booking
      const booking = await this.bookingRepository.findById(bookingId);

      if (!booking) {
        return Result.err(ApiError.notFound('Booking not found'));
      }

      const completeValidation = BookingValidator.validateComplete(booking);
      if (!completeValidation.valid) {
        return Result.err(completeValidation.error);
      }

      // Update booking status to DONE
      const completedAt = new Date();
      await this.bookingRepository.updateById(bookingId, {
        status: BookingStatus.DONE,
        completedAt,
      });

      return Result.ok({
        id: booking.id,
        status: BookingStatus.DONE,
        completedAt: completedAt.toISOString(),
      });
    } catch (error) {
      this.logger.error('Failed to complete booking', error as Error);
      return Result.err(ApiError.internalError('Failed to complete booking'));
    }
  }

  /**
   * Mark a booking as no-show (staff only)
   */
  async noShowBooking(
    bookingId: string
  ): Promise<Result<NoShowBookingResult, ApiError>> {
    try {
      // Get booking
      const booking = await this.bookingRepository.findById(bookingId);

      if (!booking) {
        return Result.err(ApiError.notFound('Booking not found'));
      }

      const noShowValidation = BookingValidator.validateNoShow(booking);
      if (!noShowValidation.valid) {
        return Result.err(noShowValidation.error);
      }

      const previousStatus = booking.status;

      // Update booking status to NO_SHOW
      await this.bookingRepository.updateById(bookingId, {
        status: BookingStatus.NO_SHOW,
      });

      return Result.ok({
        id: booking.id,
        status: BookingStatus.NO_SHOW,
        previousStatus,
        paymentMethod: booking.paymentMethod,
      });
    } catch (error) {
      this.logger.error('Failed to mark booking as no-show', error as Error);
      return Result.err(
        ApiError.internalError('Failed to mark booking as no-show')
      );
    }
  }
}
