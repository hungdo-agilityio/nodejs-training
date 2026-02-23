import { Repository, In } from 'typeorm';
import { createHash } from 'crypto';
import { ILogger, BookingStatus, PaymentMethod } from '@shared/types';
import { Result } from '@shared/utils';
import { DEFAULT_CAPACITY } from '@shared/constants/business-hours';
import { ApiError } from '@shared/errors';
import { Service } from '@modules/services/entities/service.entity';
import { Booking } from './entities/booking.entity';
import { BookingService as BookingServiceEntity } from './entities/booking-service.entity';
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
} from './booking.service.interface';

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
    private bookingRepository: Repository<Booking>,
    private bookingServiceRepository: Repository<BookingServiceEntity>,
    private serviceRepository: Repository<Service>,
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
      const services = await this.serviceRepository.find({
        where: {
          id: In(uniqueServiceIds),
          isActive: true,
        },
      });

      // Check if all services were found
      if (services.length !== uniqueServiceIds.length) {
        return Result.err(
          ApiError.notFound('One or more services not found or inactive')
        );
      }

      // Calculate totals
      const totalPrice = services.reduce(
        (sum, service) => sum + Number(service.price),
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
        price: Number(service.price),
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
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(appointmentDate)) {
        return Result.err(
          ApiError.validationError('Invalid date format. Use YYYY-MM-DD')
        );
      }

      // Validate time format
      const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
      if (!timeRegex.test(appointmentTime)) {
        return Result.err(
          ApiError.validationError(
            'Invalid time format. Use HH:MM (24-hour format)'
          )
        );
      }

      // Reject past time slots
      const appointmentDatetime = new Date(
        `${appointmentDate}T${appointmentTime}:00`
      );
      if (appointmentDatetime <= new Date()) {
        return Result.err(
          ApiError.validationError('Cannot book a time slot in the past')
        );
      }

      // Parse time
      const [hour, minute] = appointmentTime.split(':').map(Number);
      const slotStartMinutes = hour * 60 + minute;
      const slotEndMinutes = slotStartMinutes + durationMinutes;

      // Get existing bookings for this date
      const bookings = await this.bookingRepository.find({
        where: {
          appointmentDate,
          status: In([
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.AUTHORIZED,
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
          ]),
        },
        select: ['appointmentDatetime', 'totalDurationMinutes'],
      });

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
   * Create a new booking
   */
  async createBooking(
    dto: CreateBookingDTO
  ): Promise<Result<CreatedBookingResult, ApiError>> {
    try {
      // 1. Validate services and calculate totals
      const validationResult = await this.validateServicesAndCalculateTotals(
        dto.serviceIds
      );

      if (validationResult.isErr()) {
        return Result.err(validationResult.getError());
      }

      const { totalPrice, totalDurationMinutes, services } =
        validationResult.getValue();

      // 2. Check capacity availability
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

      // 4. Check if booking with this idempotency key already exists
      const existingBooking = await this.bookingRepository.findOne({
        where: { idempotencyKey },
      });

      if (existingBooking) {
        const terminalStatuses: BookingStatus[] = [
          BookingStatus.CANCELLED,
          BookingStatus.DONE,
          BookingStatus.NO_SHOW,
          BookingStatus.PAYMENT_FAILED,
        ];

        if (terminalStatuses.includes(existingBooking.status)) {
          // Free up the idempotency key so the user can rebook
          await this.bookingRepository.update(
            { id: existingBooking.id },
            { idempotencyKey: `${idempotencyKey}_${existingBooking.id}` }
          );
        } else {
          return Result.err(ApiError.conflict('Booking already exists'));
        }
      }

      // 5. Create appointment datetime
      const appointmentDatetime = new Date(
        `${dto.appointmentDate}T${dto.appointmentTime}:00`
      );

      // 6. Determine status and expiry based on payment method
      const isCashPayment = dto.paymentMethod === PaymentMethod.CASH;
      const hasPaymentIntent = !!dto.stripePaymentIntentId;
      let status: BookingStatus;
      if (isCashPayment) {
        status = BookingStatus.CONFIRMED;
      } else if (hasPaymentIntent) {
        // Card flow: booking created after successful payment
        status = BookingStatus.AUTHORIZED;
      } else {
        // Legacy flow: booking created before payment
        status = BookingStatus.PENDING_PAYMENT;
      }

      // Only set expiry for legacy flow (no payment intent provided)
      const expiresAt =
        !isCashPayment && !hasPaymentIntent
          ? new Date(Date.now() + 15 * 60 * 1000)
          : null;

      // 7. Create booking entity
      const booking = this.bookingRepository.create({
        userId: dto.userId,
        appointmentDate: dto.appointmentDate,
        appointmentDatetime,
        totalDurationMinutes,
        totalPrice,
        paymentMethod: dto.paymentMethod,
        status,
        currency: 'USD',
        idempotencyKey,
        notes: dto.notes || null,
        stripePaymentIntentId: dto.stripePaymentIntentId || null,
        expiresAt,
        checkedInAt: null,
        completedAt: null,
        cancelledAt: null,
      });

      let savedBooking: Booking;
      try {
        savedBooking = await this.bookingRepository.save(booking);
      } catch (error) {
        // Handle race condition - another request might have created the same booking
        if (
          error instanceof Error &&
          (error.message.includes('UNIQUE constraint failed') ||
            error.message.includes('duplicate key'))
        ) {
          return Result.err(ApiError.conflict('Booking already exists'));
        }

        throw error;
      }

      // 8. Create booking services
      const bookingServices = services.map((service) => {
        return this.bookingServiceRepository.create({
          bookingId: savedBooking.id,
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          serviceDurationMinutes: service.durationMinutes,
        });
      });

      await this.bookingServiceRepository.save(bookingServices);

      // Extract time from datetime for the response
      const appointmentTime = new Date(savedBooking.appointmentDatetime)
        .toTimeString()
        .substring(0, 5); // HH:MM format

      return Result.ok({
        id: savedBooking.id,
        appointmentDate: savedBooking.appointmentDate,
        appointmentDatetime: savedBooking.appointmentDatetime,
        appointmentTime: appointmentTime,
        totalPrice: savedBooking.totalPrice,
        totalDurationMinutes: savedBooking.totalDurationMinutes,
        status: savedBooking.status,
        idempotencyKey: savedBooking.idempotencyKey,
      });
    } catch {
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
      const {
        userId,
        status,
        paymentMethod,
        serviceId,
        date,
        startDate,
        endDate,
        sortBy = 'upcoming',
        page = 1,
        limit = 100,
      } = filters;

      // Determine sort field and direction based on sortBy
      let sortField: string;
      let sortDirection: 'ASC' | 'DESC';

      switch (sortBy) {
        case 'upcoming':
          sortField = 'booking.appointmentDatetime';
          sortDirection = 'ASC';
          break;
        case 'past':
          sortField = 'booking.appointmentDatetime';
          sortDirection = 'DESC';
          break;
        case 'recent':
        default:
          sortField = 'booking.createdAt';
          sortDirection = 'DESC';
          break;
      }

      // Build query with loadRelationCountAndMap to get services count
      const queryBuilder = this.bookingRepository
        .createQueryBuilder('booking')
        .loadRelationCountAndMap(
          'booking.servicesCount',
          'booking.bookingServices'
        )
        .orderBy(sortField, sortDirection);

      // Apply filters
      if (userId) {
        queryBuilder.andWhere('booking.userId = :userId', { userId });
      }

      if (status) {
        queryBuilder.andWhere('booking.status = :status', { status });
      }

      if (paymentMethod) {
        queryBuilder.andWhere('booking.paymentMethod = :paymentMethod', {
          paymentMethod,
        });
      }

      if (serviceId) {
        queryBuilder
          .leftJoin('booking.bookingServices', 'bookingService')
          .andWhere('bookingService.serviceId = :serviceId', {
            serviceId,
          });
      }

      if (date) {
        queryBuilder.andWhere('booking.appointmentDate = :date', { date });
      }

      if (startDate && endDate) {
        queryBuilder.andWhere(
          'booking.appointmentDate BETWEEN :startDate AND :endDate',
          { startDate, endDate }
        );
      } else if (startDate) {
        queryBuilder.andWhere('booking.appointmentDate >= :startDate', {
          startDate,
        });
      } else if (endDate) {
        queryBuilder.andWhere('booking.appointmentDate <= :endDate', {
          endDate,
        });
      }

      // Get total count
      const total = await queryBuilder.getCount();

      // Apply pagination
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      // Execute query
      const bookings = await queryBuilder.getMany();

      // Format response
      const data: BookingListItem[] = bookings.map((booking) => {
        const appointmentTime = new Date(booking.appointmentDatetime)
          .toTimeString()
          .substring(0, 5);

        const bookingWithCount = booking as Booking & {
          servicesCount?: number;
        };

        return {
          id: booking.id,
          servicesCount: bookingWithCount.servicesCount || 0,
          appointmentDatetime: booking.appointmentDatetime.toISOString(),
          appointmentDate: booking.appointmentDate,
          appointmentTime,
          status: booking.status,
          paymentMethod: booking.paymentMethod,
          totalPrice: Number(booking.totalPrice),
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
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId },
        relations: ['bookingServices'],
      });

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
          price: Number(bs.servicePrice),
          durationMinutes: bs.serviceDurationMinutes,
        })),
        appointmentDatetime: booking.appointmentDatetime.toISOString(),
        appointmentDate: booking.appointmentDate,
        appointmentTime,
        status: booking.status,
        paymentMethod: booking.paymentMethod,
        totalPrice: Number(booking.totalPrice),
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
      const result = await this.bookingRepository.update(
        { id: bookingId },
        { stripePaymentIntentId: paymentIntentId }
      );

      if (result.affected === 0) {
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
      const result = await this.bookingRepository.update(
        { id: bookingId },
        { status }
      );

      if (result.affected === 0) {
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
      const booking = await this.bookingRepository.findOne({
        where: { stripePaymentIntentId: paymentIntentId },
      });

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
      const booking = await this.bookingRepository.findOne({
        where: { id: bookingId },
      });

      if (!booking) {
        return Result.err(ApiError.notFound('Booking not found'));
      }

      if (booking.userId !== userId) {
        return Result.err(
          ApiError.forbidden('You do not have access to this booking')
        );
      }

      const cancellableStatuses: BookingStatus[] = [
        BookingStatus.CONFIRMED,
        BookingStatus.AUTHORIZED,
        BookingStatus.PENDING_PAYMENT,
      ];

      if (!cancellableStatuses.includes(booking.status)) {
        return Result.err(
          ApiError.validationError(
            `Booking cannot be cancelled in ${booking.status} status`
          )
        );
      }

      const now = new Date();
      const cutoff = new Date(
        new Date(booking.appointmentDatetime).getTime() - 15 * 60 * 1000
      );

      if (now >= cutoff) {
        return Result.err(
          ApiError.validationError(
            'Booking can only be cancelled at least 15 minutes before the appointment time'
          )
        );
      }

      const cancelledAt = new Date();
      await this.bookingRepository.update(
        { id: bookingId },
        { status: BookingStatus.CANCELLED, cancelledAt }
      );

      return Result.ok({
        id: booking.id,
        status: BookingStatus.CANCELLED,
        previousStatus: booking.status,
        paymentMethod: booking.paymentMethod,
        cancelledAt: cancelledAt.toISOString(),
        stripePaymentIntentId: booking.stripePaymentIntentId,
        totalPrice: Number(booking.totalPrice),
      });
    } catch (error) {
      this.logger.error('Failed to cancel booking', error as Error);
      return Result.err(ApiError.internalError('Failed to cancel booking'));
    }
  }
}
