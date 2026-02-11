'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/ui/button';
import { Calendar } from '@/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { cn } from '@/utils';
import { formatDuration } from '@/utils/booking';

interface DateOption {
  date: string; // YYYY-MM-DD format
  dayOfWeek: string;
  displayDate: string;
  duration: number; // in minutes
}

interface DateSelectorProps {
  dates: DateOption[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
}

export function DateSelector({
  dates,
  selectedDate,
  onSelectDate,
}: DateSelectorProps) {
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      // Use local date to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      onSelectDate(dateString);
    }
  };

  const selectedDateObj = selectedDate ? new Date(selectedDate) : undefined;

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {dates.map((dateOption) => {
          const isSelected = selectedDate === dateOption.date;
          return (
            <button
              key={dateOption.date}
              type="button"
              onClick={() => onSelectDate(dateOption.date)}
              className={cn(
                'flex h-auto min-w-25 cursor-pointer flex-col rounded-lg border bg-white py-3 px-4 transition-all',
                isSelected
                  ? 'border-sky-500 shadow-xl shadow-sky-500/20'
                  : 'border-gray-200 shadow-lg hover:border-sky-300 hover:shadow-xl'
              )}
            >
              <span className={cn(
                'text-xs font-medium uppercase',
                isSelected ? 'text-sky-600' : 'text-gray-600'
              )}>
                {dateOption.dayOfWeek}
              </span>
              <span className={cn(
                'mt-1 text-sm font-semibold',
                isSelected ? 'text-sky-900' : 'text-gray-900'
              )}>
                {dateOption.displayDate}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                {formatDuration(dateOption.duration)}
              </span>
            </button>
          );
        })}

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-auto min-w-25 cursor-pointer flex-col rounded-lg border border-gray-200 bg-white py-3 px-4 shadow-lg transition-all hover:border-sky-300 hover:shadow-xl"
            >
              <CalendarIcon className="mx-auto h-6 w-6 text-gray-600" />
              <span className="mt-1 text-xs font-medium text-gray-600">
                More dates
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDateObj}
              onSelect={handleCalendarSelect}
              disabled={(date) => {
                // Disable past dates
                if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
                  return true;
                }
                // Disable Sundays (0 = Sunday)
                if (date.getDay() === 0) {
                  return true;
                }
                return false;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
