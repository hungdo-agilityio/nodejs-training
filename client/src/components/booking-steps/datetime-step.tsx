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
      <div className="mb-6 flex items-center gap-3">
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
        <h2 className="text-base font-semibold text-gray-900">Select Date</h2>
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
          <>
            {timeSlots.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center shadow-md">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-base font-medium text-gray-900">
                  No slots available
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  There are no available time slots for this date. Please select
                  another date.
                </p>
              </div>
            ) : (
              <TimeSlotSelector
                slots={timeSlots}
                selectedTime={selectedTime}
                onSelectTime={onSelectTime}
              />
            )}
          </>
        )}
      </div>

      {selectedDate && selectedTime && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <Button
            onClick={onConfirm}
            className="w-full bg-gray-900 hover:bg-gray-800"
            size="lg"
          >
            Continue to Review
          </Button>
        </div>
      )}
    </>
  );
}
