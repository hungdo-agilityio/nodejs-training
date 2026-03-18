'use client';

import { Button } from '@/ui/button';
import { Service } from '@/types/service';
import { formatDuration, formatTimeForDisplay } from '@/utils/booking';
import { useMemo } from 'react';

interface ReviewStepProps {
  services: Service[];
  selectedServiceIds: string[];
  selectedDate: string | null;
  selectedTime: string | null;
  onEditServices: () => void;
  onEditDateTime: () => void;
  onContinue: () => void;
  onBack: () => void;
}

export function ReviewStep({
  services,
  selectedServiceIds,
  selectedDate,
  selectedTime,
  onEditServices,
  onEditDateTime,
  onContinue,
  onBack,
}: ReviewStepProps) {
  const selectedServices = useMemo(
    () => services.filter((service) => selectedServiceIds.includes(service.id)),
    [services, selectedServiceIds]
  );

  const { totalDuration, totalPrice } = useMemo(() => {
    return {
      totalDuration: selectedServices.reduce(
        (sum, service) => sum + service.durationMinutes,
        0
      ),
      totalPrice: selectedServices.reduce(
        (sum, service) => sum + service.price,
        0
      ),
    };
  }, [selectedServices]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
        <h2 className="text-base font-semibold text-gray-900">
          Review Your Booking
        </h2>
      </div>

      <div className="space-y-4">
        {/* Services Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Selected Services
            </h3>
            <button
              onClick={onEditServices}
              className="cursor-pointer text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2">
            {selectedServices.map((service) => (
              <div
                key={service.id}
                className="flex items-start justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {service.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-600">
                    {formatDuration(service.durationMinutes)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  ${service.price.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Date & Time Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Date & Time</h3>
            <button
              onClick={onEditDateTime}
              className="cursor-pointer text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              Edit
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-sm text-gray-900">
                {selectedDate ? formatDate(selectedDate) : 'Not selected'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="h-4 w-4 text-gray-500"
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
              <p className="text-sm text-gray-900">
                {selectedTime
                  ? formatTimeForDisplay(selectedTime)
                  : 'Not selected'}
              </p>
            </div>
          </div>
        </div>

        {/* Total Summary */}
        <div className="rounded-lg border border-gray-200 bg-linear-to-br from-sky-50 to-blue-50 p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Duration
              </p>
              <p className="mt-0.5 text-lg font-semibold text-gray-900">
                {formatDuration(totalDuration)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Total Price</p>
              <p className="mt-0.5 text-2xl font-bold text-gray-900">
                ${totalPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Terms Notice */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs text-amber-900">
            By continuing, you agree to our cancellation policy. Please arrive
            10 minutes early for your appointment.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <Button
          onClick={onContinue}
          className="w-full bg-gray-900 hover:bg-gray-800"
          size="lg"
        >
          Continue to Payment
        </Button>
      </div>
    </>
  );
}
