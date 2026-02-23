import { StaffDailyBooking } from '@/types/staff';
import { Spinner } from '@/components';
import { BookingCard } from './booking-card';

interface BookingListProps {
  bookings: StaffDailyBooking[];
  isLoading: boolean;
  error: Error | null;
  onCheckIn: (booking: StaffDailyBooking) => void;
  onComplete: (booking: StaffDailyBooking) => void;
  onNoShow: (booking: StaffDailyBooking) => void;
}

export function BookingList({
  bookings,
  isLoading,
  error,
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

  const sorted = [...bookings].sort((a, b) =>
    a.appointmentTime.localeCompare(b.appointmentTime)
  );

  return (
    <div className="space-y-4">
      {sorted.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCheckIn={() => onCheckIn(booking)}
          onComplete={() => onComplete(booking)}
          onNoShow={() => onNoShow(booking)}
        />
      ))}
    </div>
  );
}
