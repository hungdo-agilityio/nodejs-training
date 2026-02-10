import { Service } from '@/types/service';
import { formatDateToString, isPastBusinessHours } from './date';

interface DateOption {
  date: string;
  dayOfWeek: string;
  displayDate: string;
  duration: number;
}

/**
 * Calculate total duration from selected services
 */
export const calculateTotalDuration = (
  services: Service[] | undefined,
  selectedServiceIds: string[]
): number => {
  if (!services || selectedServiceIds.length === 0) return 0;
  return services
    .filter((service) => selectedServiceIds.includes(service.id))
    .reduce((total, service) => total + service.durationMinutes, 0);
};

/**
 * Generate date options for quick selection
 */
export const generateDateOptions = (
  totalDuration: number,
  selectedDate: string | null
): DateOption[] => {
  const options: DateOption[] = [];
  const today = new Date();
  const startDay = isPastBusinessHours() ? 1 : 0;

  // Add next 3 available days
  for (let i = startDay; i < startDay + 3; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = formatDateToString(date);
    options.push({
      date: dateString,
      dayOfWeek: date
        .toLocaleDateString('en-US', { weekday: 'short' })
        .toUpperCase(),
      displayDate: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      duration: totalDuration,
    });
  }

  // Add selected custom date if not in quick options
  if (selectedDate && !options.some((opt) => opt.date === selectedDate)) {
    const customDate = new Date(selectedDate + 'T00:00:00');
    options.unshift({
      date: selectedDate,
      dayOfWeek: customDate
        .toLocaleDateString('en-US', { weekday: 'short' })
        .toUpperCase(),
      displayDate: customDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      duration: totalDuration,
    });
  }

  return options;
};

/**
 * Format time slots from API response
 */
export const formatTimeSlots = (
  slots: Array<{ startTime: string; endTime: string; available: boolean }>,
  selectedDate: string | null
) => {
  return slots.map((slot) => {
    // Parse ISO datetime or handle time-only format
    const dateTime = slot.startTime.includes('T')
      ? new Date(slot.startTime)
      : new Date(`${selectedDate}T${slot.startTime}`);

    return {
      id: slot.startTime,
      time: dateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      available: slot.available,
      discount: undefined,
    };
  });
};
