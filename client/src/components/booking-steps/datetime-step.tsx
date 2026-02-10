'use client';

import { DateSelector } from '@/components/date-selector';
import { TimeSlotSelector } from '@/components/time-slot-selector';
import { Button } from '@/ui/button';

interface DateOption {
  date: string;
  dayOfWeek: string;
  displayDate: string;
  duration: number;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  discount?: number;
}

interface DateTimeStepProps {
  dateOptions: DateOption[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  isLoadingSlots: boolean;
  slotsError: unknown;
  onBack: () => void;
  onConfirm: () => void;
}

export function DateTimeStep({
  dateOptions,
  selectedDate,
  onSelectDate,
  timeSlots,
  selectedTime,
  onSelectTime,
  isLoadingSlots,
  slotsError,
  onBack,
  onConfirm,
}: DateTimeStepProps) {
  const errorMessage =
    slotsError && typeof slotsError === 'object' && 'message' in slotsError
      ? String(slotsError.message)
      : 'Unable to load time slots for this date';

  return (
    <>
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <h2 className="text-lg font-semibold text-gray-900">Date and Time</h2>
        </div>
        <p className="text-sm text-gray-600">
          Select your preferred date and time
        </p>
      </div>

      <div className="space-y-6">
        <DateSelector
          dates={dateOptions}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />

        {isLoadingSlots && selectedDate && (
          <div className="py-8 text-center text-sm text-gray-600">
            Loading available time slots...
          </div>
        )}

        {!!slotsError && selectedDate && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">{errorMessage}</p>
            <p className="mt-1 text-xs text-amber-700">
              Please select another date.
            </p>
          </div>
        )}

        {!isLoadingSlots && !slotsError && selectedDate && (
          <TimeSlotSelector
            slots={timeSlots}
            selectedTime={selectedTime}
            onSelectTime={onSelectTime}
          />
        )}
      </div>

      {selectedDate && selectedTime && (
        <div className="mt-6 border-t pt-6">
          <Button onClick={onConfirm} className="w-full">
            Confirm Appointment
          </Button>
        </div>
      )}
    </>
  );
}
