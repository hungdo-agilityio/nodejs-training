'use client';

import { useState, useMemo } from 'react';
import { UserButton } from '@clerk/nextjs';
import { useLogout, useAvailableSlots, useServices } from '@/hooks';
import { useAuthStore } from '@/stores';
import { ServiceStep } from '@/components/booking-steps/service-step';
import { DateTimeStep } from '@/components/booking-steps/datetime-step';
import {
  calculateTotalDuration,
  generateDateOptions,
  formatTimeSlots,
} from '@/utils/booking';
import { getDefaultDate } from '@/utils/date';
import Link from 'next/link';

export default function NewBookingPage() {
  const { isLoggingOut } = useAuthStore();
  const { logout } = useLogout();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<'services' | 'datetime'>('services');

  const { data: services } = useServices();

  const totalDuration = useMemo(
    () => calculateTotalDuration(services, selectedServiceIds),
    [services, selectedServiceIds]
  );

  const dateOptions = useMemo(
    () => generateDateOptions(totalDuration, selectedDate),
    [totalDuration, selectedDate]
  );

  // Only fetch slots when on datetime step
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
    error: slotsError,
  } = useAvailableSlots(
    {
      date: selectedDate || '',
      serviceIds: selectedServiceIds,
    },
    step === 'datetime'
  );

  const timeSlots = useMemo(
    () =>
      slotsData?.slots
        ? formatTimeSlots(slotsData.slots, selectedDate)
        : [],
    [slotsData, selectedDate]
  );

  const handleContinueToDateTime = () => {
    if (selectedServiceIds.length > 0) {
      if (!selectedDate) {
        setSelectedDate(getDefaultDate());
      }
      setStep('datetime');
    }
  };

  const handleBackToServices = () => {
    setStep('services');
  };

  const handleConfirmBooking = () => {
    // TODO: Implement booking confirmation
    console.log('Booking confirmed', {
      services: selectedServiceIds,
      date: selectedDate,
      time: selectedTime,
    });
  };

  const handleLogout = () => {
    logout('/sign-in');
  };

  return (
    <div className="min-h-screen bg-sky-50">
      {/* Header */}
      <header className="border-b border-sky-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-sky-900">
              Salon Booking
            </Link>
            <nav className="flex gap-4">
              <Link
                href="/bookings"
                className="text-sm text-slate-600 hover:text-sky-600"
              >
                My Bookings
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-sky-900">Create New Booking</h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          {step === 'services' ? (
            <ServiceStep
              selectedServiceIds={selectedServiceIds}
              onSelectionChange={setSelectedServiceIds}
              onContinue={handleContinueToDateTime}
            />
          ) : (
            <DateTimeStep
              dateOptions={dateOptions}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              timeSlots={timeSlots}
              selectedTime={selectedTime}
              onSelectTime={setSelectedTime}
              isLoadingSlots={isLoadingSlots}
              slotsError={slotsError}
              onBack={handleBackToServices}
              onConfirm={handleConfirmBooking}
            />
          )}
        </div>
      </main>
    </div>
  );
}
