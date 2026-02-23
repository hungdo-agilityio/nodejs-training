'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useMe } from '@/hooks';
import { useCheckInBooking } from '@/hooks/use-check-in-booking';
import { useCompleteBooking } from '@/hooks/use-complete-booking';
import { useNoShowBooking } from '@/hooks/use-no-show-booking';
import { Spinner } from '@/components';
import { StaffDailyBooking } from '@/types/staff';
import { StaffHeader } from './_components/staff-header';
import { DateNavigation } from './_components/date-navigation';
import { SummaryCards } from './_components/summary-cards';
import { BookingList } from './_components/booking-list';
import { ConfirmDialog } from './_components/confirm-dialog';
import { MOCK_BOOKINGS, getMockSummary } from './_components/mock-data';
import { formatDateToString, formatTime } from '@/utils';

type ConfirmAction = {
  type: 'check-in' | 'complete' | 'no-show';
  booking: StaffDailyBooking;
};

const CONFIRM_CONFIG = {
  'check-in': {
    title: 'Check In Customer',
    actionLabel: 'Check In',
    actionClass: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  complete: {
    title: 'Complete Booking',
    actionLabel: 'Complete',
    actionClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
  'no-show': {
    title: 'Mark as No-Show',
    actionLabel: 'Mark No-Show',
    actionClass: 'bg-gray-600 hover:bg-gray-700 text-white',
  },
} as const;

function getConfirmDescription(action: ConfirmAction): string {
  const { type, booking } = action;
  const name = booking.customer.name;
  const time = formatTime(booking.appointmentTime);

  switch (type) {
    case 'check-in':
      return `Check in ${name} for their ${time} appointment?${booking.paymentMethod === 'STRIPE' ? ' This will capture the card payment.' : ''}`;
    case 'complete':
      return `Mark ${name}'s booking as complete?`;
    case 'no-show':
      return `Mark ${name} as a no-show for their ${time} appointment?`;
  }
}

export default function StaffDashboard() {
  const { isLoading: isMeLoading } = useMe();
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateToString(new Date())
  );
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );

  // TODO: replace mock with useStaffDailyBookings(selectedDate) once API is ready
  const bookings = MOCK_BOOKINGS;
  const summary = getMockSummary(bookings);
  const isLoading = false;
  const error = null as Error | null;

  const checkIn = useCheckInBooking({
    onSuccess: () => {
      toast.success('Customer checked in successfully');
      setConfirmAction(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to check in');
      setConfirmAction(null);
    },
  });

  const complete = useCompleteBooking({
    onSuccess: () => {
      toast.success('Booking marked as complete');
      setConfirmAction(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to complete booking');
      setConfirmAction(null);
    },
  });

  const noShow = useNoShowBooking({
    onSuccess: () => {
      toast.success('Booking marked as no-show');
      setConfirmAction(null);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to mark no-show');
      setConfirmAction(null);
    },
  });

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, booking } = confirmAction;

    switch (type) {
      case 'check-in':
        checkIn.mutate(booking.id);
        break;
      case 'complete':
        complete.mutate(booking.id);
        break;
      case 'no-show':
        noShow.mutate({ bookingId: booking.id });
        break;
    }
  };

  const isActionPending =
    checkIn.isPending || complete.isPending || noShow.isPending;

  if (isMeLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <Spinner size="lg" className="text-sky-500" />
      </div>
    );
  }

  const dialogConfig = confirmAction
    ? CONFIRM_CONFIG[confirmAction.type]
    : null;

  return (
    <div className="min-h-screen bg-sky-50">
      <StaffHeader />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <DateNavigation
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        <SummaryCards
          total={summary.total}
          checkedIn={summary.byStatus.CHECKED_IN ?? 0}
          completed={summary.byStatus.DONE ?? 0}
        />

        <BookingList
          bookings={bookings}
          isLoading={isLoading}
          error={error}
          onCheckIn={(b) => setConfirmAction({ type: 'check-in', booking: b })}
          onComplete={(b) => setConfirmAction({ type: 'complete', booking: b })}
          onNoShow={(b) => setConfirmAction({ type: 'no-show', booking: b })}
        />
      </main>

      {confirmAction && dialogConfig && (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) setConfirmAction(null);
          }}
          title={dialogConfig.title}
          description={getConfirmDescription(confirmAction)}
          actionLabel={dialogConfig.actionLabel}
          actionClass={dialogConfig.actionClass}
          isPending={isActionPending}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
