import { StaffDailyBooking } from '@/types/staff';
import { Spinner } from '@/components';
import { BookingCard } from './booking-card';

interface BookingListProps {
  bookings: StaffDailyBooking[];
  isLoading: boolean;
  error: Error | null;
  selectedDate: string;
  onCheckIn: (booking: StaffDailyBooking) => void;
  onComplete: (booking: StaffDailyBooking) => void;
  onNoShow: (booking: StaffDailyBooking) => void;
}

export function BookingList({
  bookings,
  isLoading,
  error,
  selectedDate,
  onCheckIn,
  onComplete,
  onNoShow,
}: BookingListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" className="text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center text-red-600">
        Failed to load bookings: {error.message}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center text-sky-500 shadow-sm">
        No bookings for this date.
      </div>
    );
  }

  // Check if booking is overdue
  const isBookingOverdue = (booking: StaffDailyBooking): boolean => {
    // Only consider CONFIRMED or AUTHORIZED bookings as potentially overdue
    const overdueStatuses = ['CONFIRMED', 'AUTHORIZED'];
    if (!overdueStatuses.includes(booking.status)) {
      return false;
    }

    // Parse appointment time (HH:MM format) and combine with selected date
    const [hours, minutes] = booking.appointmentTime.split(':').map(Number);
    const appointmentDateTime = new Date(`${selectedDate}T00:00:00`);
    appointmentDateTime.setHours(hours, minutes, 0, 0);

    // Booking is overdue if appointment time has passed
    return new Date() > appointmentDateTime;
  };

  // Sort: overdue first, then by appointment time
  const sorted = [...bookings].sort((a, b) => {
    const aOverdue = isBookingOverdue(a);
    const bOverdue = isBookingOverdue(b);

    // Overdue bookings come first
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Within same overdue status, sort by time
    return a.appointmentTime.localeCompare(b.appointmentTime);
  });

  return (
    <div className="space-y-4">
      {sorted.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCheckIn={() => onCheckIn(booking)}
          onComplete={() => onComplete(booking)}
          onNoShow={() => onNoShow(booking)}
          isOverdue={isBookingOverdue(booking)}
        />
      ))}
    </div>
  );
}
