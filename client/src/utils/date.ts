// Business hours close time
const BUSINESS_CLOSE_HOURS: Record<number, string> = {
  0: '00:00', // Sunday - closed
  1: '18:00', // Monday
  2: '18:00', // Tuesday
  3: '18:00', // Wednesday
  4: '18:00', // Thursday
  5: '18:00', // Friday
  6: '12:00', // Saturday
};

/**
 * Format date object to YYYY-MM-DD string
 */
export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Check if current time is past business hours
 */
export const isPastBusinessHours = (): boolean => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const closeTime = BUSINESS_CLOSE_HOURS[dayOfWeek];
  return dayOfWeek === 0 || currentTime >= closeTime;
};

/**
 * Format a YYYY-MM-DD string to a long display format
 * e.g. "2026-02-23" → "Monday, February 23, 2026"
 */
export const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Get default date based on business hours
 * Returns today if within hours, tomorrow if past hours
 */
export const getDefaultDate = (): string => {
  const now = new Date();

  if (isPastBusinessHours()) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    return formatDateToString(tomorrow);
  }

  return formatDateToString(now);
};

/**
 * Format time from "HH:mm" to "h:mm AM/PM"
 * e.g. "14:30" → "2:30 PM"
 */
export const formatTime = (time: string): string => {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;

  return `${displayHour}:${m} ${ampm}`;
};
