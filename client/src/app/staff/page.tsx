'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  useMe,
  useStaffDailyBookings,
  useCheckInBooking,
  useCompleteBooking,
  useNoShowBooking,
} from '@/hooks';
import {
  Spinner,
  StaffHeader,
  DateNavigation,
  SummaryCards,
  BookingList,
  ConfirmDialog,
} from '@/components';
import { StaffDailyBooking } from '@/types/staff';
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

const getConfirmDescription = ({ type, booking }: ConfirmAction): string => {
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
};

export default function StaffDashboard() {
  const { isLoading: isMeLoading } = useMe();
  const [selectedDate, setSelectedDate] = useState(() =>
    formatDateToString(new Date())
  );
  const [excludeCompleted, setExcludeCompleted] = useState(true);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null
  );

  // Fetch filtered bookings for the list
  const {
    data: filteredData,
    isLoading,
    error,
    refetch,
  } = useStaffDailyBookings(selectedDate, excludeCompleted);

  // Fetch full stats for summary (always unfiltered)
  const { data: fullData } = useStaffDailyBookings(selectedDate, false);

  const bookings = filteredData?.bookings ?? [];
  // Use full data for summary to always show complete picture
  const summary = fullData?.summary ?? {
    total: 0,
    byStatus: {} as Record<string, number>,
    byPaymentMethod: {} as Record<string, number>,
    totalRevenue: 0,
  };

  const checkIn = useCheckInBooking({
    onSuccess: () => {
      toast.success('Customer checked in successfully');
      setConfirmAction(null);
      refetch();
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
      refetch();
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
      refetch();
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
        noShow.mutate(booking.id);
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

        {/* Filter Toggle */}
        <div className="mb-6 flex items-center justify-end">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 shadow-sm transition-colors hover:bg-sky-50">
            <input
              type="checkbox"
              checked={excludeCompleted}
              onChange={(e) => setExcludeCompleted(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-gray-300 text-sky-600 focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
            />
            <span className="text-sm font-medium text-slate-700 select-none">
              Show active bookings only
            </span>
          </label>
        </div>

        <SummaryCards
          total={summary.total}
          checkedIn={
            (summary.byStatus as Record<string, number>)?.['CHECKED_IN'] ?? 0
          }
          completed={
            (summary.byStatus as Record<string, number>)?.['DONE'] ?? 0
          }
          totalRevenue={summary.totalRevenue}
        />

        <BookingList
          bookings={bookings}
          isLoading={isLoading}
          error={error}
          selectedDate={selectedDate}
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
