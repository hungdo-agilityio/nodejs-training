import { StaffDailyBooking } from '@/types/staff';
import { BookingStatus } from '@/types/booking';
import { Button } from '@/ui/button';
import { computeEndsAt, formatTime } from '@/utils';

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
  AUTHORIZED: {
    label: 'Authorized',
    className: 'bg-purple-100 text-purple-800',
  },
  CHECKED_IN: {
    label: 'Checked In',
    className: 'bg-yellow-100 text-yellow-800',
  },
  DONE: { label: 'Completed', className: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
  NO_SHOW: { label: 'No Show', className: 'bg-gray-100 text-gray-800' },
  PENDING_PAYMENT: {
    label: 'Pending Payment',
    className: 'bg-orange-100 text-orange-800',
  },
  EXPIRED: { label: 'Expired', className: 'bg-gray-100 text-gray-500' },
};

const PAYMENT_CONFIG: Record<string, { label: string; className: string }> = {
  CASH: { label: 'Cash', className: 'bg-emerald-100 text-emerald-800' },
  STRIPE: { label: 'Card', className: 'bg-indigo-100 text-indigo-800' },
};

interface BookingCardProps {
  booking: StaffDailyBooking;
  onCheckIn: () => void;
  onComplete: () => void;
  onNoShow: () => void;
}

export const BookingCard = ({
  booking,
  onCheckIn,
  onComplete,
  onNoShow,
}: BookingCardProps) => {
  const statusConfig = STATUS_CONFIG[booking.status] ?? {
    label: booking.status,
    className: 'bg-gray-100 text-gray-800',
  };
  const paymentConfig = PAYMENT_CONFIG[booking.paymentMethod] ?? {
    label: booking.paymentMethod,
    className: 'bg-gray-100 text-gray-800',
  };

  const endsAt =
    booking.endsAt ||
    computeEndsAt(booking.appointmentTime, booking.totalDurationMinutes);

  const canCheckIn =
    booking.status === ('CONFIRMED' as BookingStatus) ||
    booking.status === ('AUTHORIZED' as BookingStatus);
  const canComplete = booking.status === ('CHECKED_IN' as BookingStatus);
  const hasActions = canCheckIn || canComplete;

  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: booking info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-sky-900">
              {formatTime(booking.appointmentTime)} - {formatTime(endsAt)}
            </span>
            <span className="text-sm text-sky-500">
              ({booking.totalDurationMinutes} min)
            </span>
          </div>

          <div>
            <p className="font-medium text-slate-800">
              {booking.customer.name}
            </p>
            <p className="text-sm text-slate-500">{booking.customer.email}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {booking.services.map((service, i) => (
              <span
                key={i}
                className="rounded-md bg-sky-50 px-2 py-1 text-xs text-sky-700"
              >
                {service.name} ({service.durationMinutes}min)
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.className}`}
            >
              {statusConfig.label}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentConfig.className}`}
            >
              {paymentConfig.label}
            </span>
          </div>
        </div>

        {/* Right: price + actions */}
        <div className="flex flex-col items-end gap-3">
          <p className="text-xl font-bold text-sky-900">
            ${Number(booking.totalPrice).toFixed(2)}
          </p>

          {hasActions && (
            <div className="flex gap-2">
              {canCheckIn && (
                <>
                  <Button variant="check-in" size="sm" onClick={onCheckIn}>
                    Check In
                  </Button>
                  <Button variant="no-show" size="sm" onClick={onNoShow}>
                    No Show
                  </Button>
                </>
              )}
              {canComplete && (
                <Button variant="complete" size="sm" onClick={onComplete}>
                  Complete
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
