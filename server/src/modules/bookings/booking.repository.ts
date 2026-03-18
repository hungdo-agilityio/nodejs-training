import { Repository, In, DataSource } from 'typeorm';
import { BookingStatus } from '@shared/types';
import { DEFAULT_CAPACITY } from '@shared/constants';
import { Booking } from './entities/booking.entity';
import { BookingService as BookingServiceEntity } from './entities/booking-service.entity';
import { GetBookingsFilters } from './booking.service.interface';
import {
  IBookingRepository,
  CreateBookingParams,
  BookingCapacityError,
  BookingDuplicateError,
} from './booking.repository.interface';

export class BookingRepository implements IBookingRepository {
  private repository: Repository<Booking>;

  constructor(private dataSource: DataSource) {
    this.repository = dataSource.getRepository(Booking);
  }

  async findById(id: string): Promise<Booking | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByIdWithServices(id: string): Promise<Booking | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['bookingServices'],
    });
  }

  async findByPaymentIntentId(
    paymentIntentId: string
  ): Promise<Booking | null> {
    return this.repository.findOne({
      where: { stripePaymentIntentId: paymentIntentId },
    });
  }

  async findByIdempotencyKey(key: string): Promise<Booking | null> {
    return this.repository.findOne({ where: { idempotencyKey: key } });
  }

  async findActiveByDate(
    date: string,
    statuses: BookingStatus[]
  ): Promise<Pick<Booking, 'appointmentDatetime' | 'totalDurationMinutes'>[]> {
    return this.repository.find({
      where: {
        appointmentDate: date,
        status: In(statuses),
      },
      select: ['appointmentDatetime', 'totalDurationMinutes'],
    });
  }

  async findWithFilters(filters: GetBookingsFilters): Promise<{
    data: (Booking & { servicesCount?: number })[];
    total: number;
  }> {
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

    const queryBuilder = this.repository
      .createQueryBuilder('booking')
      .loadRelationCountAndMap(
        'booking.servicesCount',
        'booking.bookingServices'
      )
      .orderBy(sortField, sortDirection);

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
        .andWhere('bookingService.serviceId = :serviceId', { serviceId });
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

    const total = await queryBuilder.getCount();

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const data = (await queryBuilder.getMany()) as (Booking & {
      servicesCount?: number;
    })[];

    return { data, total };
  }

  async findDailyWithDetails(
    date: string,
    excludeStatuses?: BookingStatus[]
  ): Promise<Booking[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.user', 'user')
      .leftJoinAndSelect('booking.bookingServices', 'bookingServices')
      .where('booking.appointmentDate = :date', { date });

    if (excludeStatuses && excludeStatuses.length > 0) {
      queryBuilder.andWhere('booking.status NOT IN (:...excludeStatuses)', {
        excludeStatuses,
      });
    }

    return queryBuilder.orderBy('booking.appointmentDatetime', 'ASC').getMany();
  }

  async updateById(id: string, data: Partial<Booking>): Promise<boolean> {
    const result = await this.repository.update({ id }, data);
    return (result.affected ?? 0) > 0;
  }

  async createBookingWithServices(
    params: CreateBookingParams
  ): Promise<Booking> {
    return this.dataSource.transaction<Booking>(async (manager) => {
      const bookingRepo = manager.getRepository(Booking);
      const bookingServiceRepo = manager.getRepository(BookingServiceEntity);

      // Re-check capacity inside the transaction
      const [hour, minute] = params.appointmentTime.split(':').map(Number);
      const slotStartMinutes = hour * 60 + minute;
      const slotEndMinutes = slotStartMinutes + params.totalDurationMinutes;

      const bookings = await manager.getRepository(Booking).find({
        where: {
          appointmentDate: params.appointmentDate,
          status: In([
            BookingStatus.PENDING_PAYMENT,
            BookingStatus.AUTHORIZED,
            BookingStatus.CONFIRMED,
            BookingStatus.CHECKED_IN,
          ]),
        },
        select: ['appointmentDatetime', 'totalDurationMinutes'],
      });

      let occupiedCount = 0;
      for (const booking of bookings) {
        const bookingDate = new Date(booking.appointmentDatetime);
        const bookingStartMinutes =
          bookingDate.getHours() * 60 + bookingDate.getMinutes();
        const bookingEndMinutes =
          bookingStartMinutes + booking.totalDurationMinutes;

        if (
          bookingStartMinutes < slotEndMinutes &&
          bookingEndMinutes > slotStartMinutes
        ) {
          occupiedCount++;
        }
      }

      if (occupiedCount >= DEFAULT_CAPACITY) {
        throw new BookingCapacityError();
      }

      // Handle idempotency key collision
      const existingBooking = await bookingRepo.findOne({
        where: { idempotencyKey: params.idempotencyKey },
      });

      if (existingBooking) {
        const terminalStatuses: BookingStatus[] = [
          BookingStatus.CANCELLED,
          BookingStatus.DONE,
          BookingStatus.NO_SHOW,
          BookingStatus.PAYMENT_FAILED,
        ];

        if (terminalStatuses.includes(existingBooking.status)) {
          await bookingRepo.update(
            { id: existingBooking.id },
            {
              idempotencyKey: `${params.idempotencyKey}_${existingBooking.id}`,
            }
          );
        } else {
          throw new BookingDuplicateError();
        }
      }

      // Persist the booking row
      const booking = bookingRepo.create({
        userId: params.userId,
        appointmentDate: params.appointmentDate,
        appointmentDatetime: params.appointmentDatetime,
        totalDurationMinutes: params.totalDurationMinutes,
        totalPrice: params.totalPrice,
        paymentMethod: params.paymentMethod,
        status: params.status,
        currency: params.currency,
        idempotencyKey: params.idempotencyKey,
        notes: params.notes,
        stripePaymentIntentId: params.stripePaymentIntentId,
        checkedInAt: null,
        completedAt: null,
        cancelledAt: null,
      });

      let savedBooking: Booking;
      try {
        savedBooking = await bookingRepo.save(booking);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('UNIQUE constraint failed') ||
            error.message.includes('duplicate key'))
        ) {
          throw new BookingDuplicateError();
        }
        throw error;
      }

      // Persist service rows atomically with the booking
      const bookingServices = params.services.map((service) =>
        bookingServiceRepo.create({
          bookingId: savedBooking.id,
          serviceId: service.id,
          serviceName: service.name,
          servicePrice: service.price,
          serviceDurationMinutes: service.durationMinutes,
        })
      );

      await bookingServiceRepo.save(bookingServices);

      return savedBooking;
    });
  }
}
