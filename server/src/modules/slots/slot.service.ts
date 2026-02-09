import { Repository, In } from 'typeorm';
import { Result } from '@shared/utils';
import { ILogger } from '@shared/types';
import {
  BUSINESS_HOURS,
  SLOT_INTERVAL_MINUTES,
  DEFAULT_CAPACITY,
} from '@shared/constants/business-hours';
import { Booking } from '@modules/bookings/entities/booking.entity';
import { Service } from '@modules/services/entities/service.entity';
import {
  ISlotService,
  GetSlotsParams,
  SlotAvailabilityResponse,
  SlotInfo,
} from './slot.service.interface';

export class SlotService implements ISlotService {
  constructor(
    private bookingRepository: Repository<Booking>,
    private serviceRepository: Repository<Service>,
    private logger: ILogger
  ) {}

  async getAvailableSlots(
    params: GetSlotsParams
  ): Promise<Result<SlotAvailabilityResponse, string>> {
    try {
      const { date, serviceIds } = params;

      // Validate date format and ensure it's not in the past
      const requestedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(requestedDate.getTime())) {
        return Result.err('Invalid date format. Use YYYY-MM-DD');
      }

      if (requestedDate < today) {
        return Result.err('Date cannot be in the past');
      }

      // Get day of week
      const dayOfWeek = requestedDate.getDay();
      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      // Get business hours for this day
      const businessHours = BUSINESS_HOURS.find(
        (bh) => bh.dayOfWeek === dayOfWeek
      );

      if (!businessHours || !businessHours.isOpen) {
        return Result.err('Salon is closed on this day');
      }

      // Calculate total duration if services provided
      let totalDuration = 0;
      if (serviceIds && serviceIds.length > 0) {
        const services = await this.serviceRepository.find({
          where: {
            id: In(serviceIds),
            isActive: true,
          },
        });

        if (services.length !== serviceIds.length) {
          return Result.err('One or more services not found or inactive');
        }

        totalDuration = services.reduce(
          (sum, service) => sum + service.durationMinutes,
          0
        );
      }

      // Generate all possible slots
      const slots = this.generateSlots(
        businessHours.openTime!,
        businessHours.closeTime!,
        businessHours.lunchBreakStart,
        businessHours.lunchBreakEnd,
        totalDuration
      );

      // Get bookings for this date to calculate capacity
      const bookings = await this.bookingRepository.find({
        where: {
          appointmentDate: date,
          status: In([
            'PENDING_PAYMENT',
            'AUTHORIZED',
            'CONFIRMED',
            'CHECKED_IN',
          ]),
        },
        select: ['appointmentDatetime', 'totalDurationMinutes'],
      });

      // Calculate occupied count for each slot
      const slotsWithAvailability = slots.map((slot) => {
        const occupied = this.calculateOccupiedCount(
          slot.startTime,
          date,
          bookings,
          totalDuration || SLOT_INTERVAL_MINUTES
        );

        return {
          ...slot,
          capacity: DEFAULT_CAPACITY,
          occupied,
          available: occupied < DEFAULT_CAPACITY,
        };
      });

      const response: SlotAvailabilityResponse = {
        date,
        dayOfWeek,
        dayName: dayNames[dayOfWeek],
        businessHours: {
          openTime: businessHours.openTime!,
          closeTime: businessHours.closeTime!,
          lunchBreak: businessHours.lunchBreakStart
            ? {
                start: businessHours.lunchBreakStart,
                end: businessHours.lunchBreakEnd!,
              }
            : undefined,
          capacity: DEFAULT_CAPACITY,
          slotInterval: SLOT_INTERVAL_MINUTES,
        },
        slots: slotsWithAvailability,
      };

      if (totalDuration > 0) {
        response.requiredDuration = totalDuration;
      }

      return Result.ok(response);
    } catch (error) {
      this.logger.error('Failed to get available slots', error as Error);
      return Result.err('Failed to retrieve available slots');
    }
  }

  private generateSlots(
    openTime: string,
    closeTime: string,
    lunchStart?: string,
    lunchEnd?: string,
    requiredDuration: number = 0
  ): SlotInfo[] {
    const slots: SlotInfo[] = [];
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);

    let currentMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;

    // Parse lunch break if exists
    let lunchStartMin: number | undefined;
    let lunchEndMin: number | undefined;
    if (lunchStart && lunchEnd) {
      const [lsHour, lsMin] = lunchStart.split(':').map(Number);
      const [leHour, leMin] = lunchEnd.split(':').map(Number);
      lunchStartMin = lsHour * 60 + lsMin;
      lunchEndMin = leHour * 60 + leMin;
    }

    while (currentMinutes < closeMinutes) {
      // Check if slot is during lunch break
      if (
        lunchStartMin !== undefined &&
        lunchEndMin !== undefined &&
        currentMinutes >= lunchStartMin &&
        currentMinutes < lunchEndMin
      ) {
        currentMinutes += SLOT_INTERVAL_MINUTES;
        continue;
      }

      // If required duration is specified, check if slot can fit
      if (requiredDuration > 0) {
        const endMinutes = currentMinutes + requiredDuration;

        // Check if end time exceeds close time
        if (endMinutes > closeMinutes) {
          break;
        }

        // Check if slot overlaps with lunch break
        if (
          lunchStartMin !== undefined &&
          lunchEndMin !== undefined &&
          currentMinutes < lunchEndMin &&
          endMinutes > lunchStartMin
        ) {
          currentMinutes += SLOT_INTERVAL_MINUTES;
          continue;
        }

        slots.push({
          startTime: this.minutesToTime(currentMinutes),
          endsAt: this.minutesToTime(endMinutes),
          capacity: 0,
          occupied: 0,
          available: false,
        });
      } else {
        slots.push({
          startTime: this.minutesToTime(currentMinutes),
          capacity: 0,
          occupied: 0,
          available: false,
        });
      }

      currentMinutes += SLOT_INTERVAL_MINUTES;
    }

    return slots;
  }

  private calculateOccupiedCount(
    slotStartTime: string,
    date: string,
    bookings: Booking[],
    duration: number
  ): number {
    const [slotHour, slotMin] = slotStartTime.split(':').map(Number);
    const slotStartMinutes = slotHour * 60 + slotMin;
    const slotEndMinutes = slotStartMinutes + duration;

    let occupied = 0;

    for (const booking of bookings) {
      const bookingDate = new Date(booking.appointmentDatetime);
      const bookingStartMinutes =
        bookingDate.getHours() * 60 + bookingDate.getMinutes();
      const bookingEndMinutes =
        bookingStartMinutes + booking.totalDurationMinutes;

      // Check if booking overlaps with this slot
      if (
        bookingStartMinutes < slotEndMinutes &&
        bookingEndMinutes > slotStartMinutes
      ) {
        occupied++;
      }
    }

    return occupied;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
}
