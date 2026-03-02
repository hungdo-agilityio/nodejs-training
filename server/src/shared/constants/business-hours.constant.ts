export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export interface TimeSlot {
  open: string;
  close: string;
}

export interface DaySchedule {
  dayOfWeek: DayOfWeek;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
  lunchBreakStart?: string;
  lunchBreakEnd?: string;
}

export const SLOT_INTERVAL_MINUTES = 30;
export const DEFAULT_CAPACITY = 1;

export const BUSINESS_HOURS: DaySchedule[] = [
  {
    dayOfWeek: DayOfWeek.SUNDAY,
    isOpen: false,
  },
  {
    dayOfWeek: DayOfWeek.MONDAY,
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
  },
  {
    dayOfWeek: DayOfWeek.TUESDAY,
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
  },
  {
    dayOfWeek: DayOfWeek.WEDNESDAY,
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
  },
  {
    dayOfWeek: DayOfWeek.THURSDAY,
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
  },
  {
    dayOfWeek: DayOfWeek.FRIDAY,
    isOpen: true,
    openTime: '09:00',
    closeTime: '18:00',
    lunchBreakStart: '12:00',
    lunchBreakEnd: '13:00',
  },
  {
    dayOfWeek: DayOfWeek.SATURDAY,
    isOpen: true,
    openTime: '09:00',
    closeTime: '12:00',
  },
];
