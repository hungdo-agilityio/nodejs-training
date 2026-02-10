'use client';

import { Button } from '@/ui/button';
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
        {slots.map((slot) => (
          <Button
            key={slot.id}
            type="button"
            variant={selectedTime === slot.time ? 'default' : 'outline'}
            onClick={() => slot.available && onSelectTime(slot.time)}
            disabled={!slot.available}
            className={cn(
              'w-full justify-between',
              selectedTime === slot.time &&
                'border-sky-500 bg-sky-50 text-sky-900 hover:bg-sky-100',
              !slot.available && 'cursor-not-allowed opacity-50'
            )}
          >
            <span className="text-sm font-medium">{slot.time}</span>
            {slot.available && slot.discount && (
              <span className="text-xs font-semibold text-green-600">
                {slot.discount}% Off
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
