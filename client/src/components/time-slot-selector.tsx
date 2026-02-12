'use client';

import { cn } from '@/utils';

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  discount?: number; // percentage discount
}

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export function TimeSlotSelector({
  slots,
  selectedTime,
  onSelectTime,
}: TimeSlotSelectorProps) {
  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        Select Time
      </h2>
      <div className="max-h-100 space-y-2 overflow-y-auto">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.id;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => slot.available && onSelectTime(slot.id)}
              disabled={!slot.available}
              className={cn(
                'flex w-full cursor-pointer items-center justify-between rounded-lg border bg-white px-4 py-3 transition-all',
                slot.available
                  ? isSelected
                    ? 'border-sky-500 shadow-xl shadow-sky-500/20'
                    : 'border-gray-200 shadow-lg hover:border-sky-300 hover:shadow-xl'
                  : 'cursor-not-allowed border-gray-200 opacity-50 shadow-md'
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-sky-900' : 'text-gray-900'
                )}
              >
                {slot.time}
              </span>
              {slot.available && slot.discount && (
                <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                  {slot.discount}% Off
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
