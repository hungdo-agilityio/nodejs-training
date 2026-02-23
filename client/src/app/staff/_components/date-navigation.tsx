'use client';

import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import { Calendar } from '@/ui/calendar';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface DateNavigationProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export function DateNavigation({
  selectedDate,
  onDateChange,
}: DateNavigationProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const isToday = selectedDate === formatDate(new Date());
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');

  const goToPrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    onDateChange(formatDate(d));
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    onDateChange(formatDate(d));
  };

  const goToToday = () => {
    onDateChange(formatDate(new Date()));
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      onDateChange(formatDate(date));
      setCalendarOpen(false);
    }
  };

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-sky-900">Daily Bookings</h2>
        <p className="text-sm text-sky-600">
          {formatDisplayDate(selectedDate)}
        </p>
      </div>
      <div className="flex items-center gap-1.5">
        <Button
          variant="sky-outline"
          size="icon"
          onClick={goToPrevDay}
          aria-label="Previous day"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="sky-outline"
          size="sm"
          onClick={goToToday}
          disabled={isToday}
        >
          Today
        </Button>
        <Button
          variant="sky-outline"
          size="icon"
          onClick={goToNextDay}
          aria-label="Next day"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="sky-outline"
              size="icon"
              className="ml-1"
              aria-label="Pick a date"
            >
              <CalendarIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDateObj}
              onSelect={handleCalendarSelect}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
