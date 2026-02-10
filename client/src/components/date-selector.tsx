'use client';

import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/ui/button';
import { Calendar } from '@/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { cn } from '@/utils';

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
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        Select Date
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {dates.map((dateOption) => (
          <Button
            key={dateOption.date}
            type="button"
            variant={selectedDate === dateOption.date ? 'default' : 'outline'}
            onClick={() => onSelectDate(dateOption.date)}
            className={cn(
              'h-auto min-w-25 flex-col py-3',
              selectedDate === dateOption.date &&
                'border-sky-500 bg-sky-50 text-sky-900 hover:bg-sky-100'
            )}
          >
            <span className="text-xs font-medium text-gray-600 uppercase">
              {dateOption.dayOfWeek}
            </span>
            <span className="mt-1 text-sm font-semibold">
              {dateOption.displayDate}
            </span>
            <span className="mt-1 text-xs text-gray-500">
              {dateOption.duration} mins
            </span>
          </Button>
        ))}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-w-25 flex-col py-3"
            >
              <CalendarIcon className="h-6 w-6 text-gray-600" />
              <span className="mt-1 text-xs font-medium text-gray-600">
                More dates
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDateObj}
              onSelect={handleCalendarSelect}
              disabled={(date) =>
                date < new Date(new Date().setHours(0, 0, 0, 0))
              }
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
