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
      return Result.err(
        ApiError.internalError('Failed to validate services')
      );
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
          ApiError.conflict(
            'No capacity available for the requested time slot'
          )
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
        return Result.err(ApiError.conflict('Booking already exists'));
      }

      // 5. Create appointment datetime
      const appointmentDatetime = new Date(
        `${dto.appointmentDate}T${dto.appointmentTime}:00`
      );

      // 6. Determine status and expiry based on payment method
      const isCashPayment = dto.paymentMethod === PaymentMethod.CASH;
      const status = isCashPayment
        ? BookingStatus.CONFIRMED
        : BookingStatus.PENDING_PAYMENT;

      // Set expiry to 15 minutes for card payments
      const expiresAt = !isCashPayment
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
        stripePaymentIntentId: null,
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
      return Result.err(
        ApiError.internalError('Failed to create booking')
      );
    }
  }
}
