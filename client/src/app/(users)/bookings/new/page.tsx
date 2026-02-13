'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAvailableSlots, useServices, useCreateBooking } from '@/hooks';
import { ServiceStep } from '@/components/booking-steps/service-step';
import { DateTimeStep } from '@/components/booking-steps/datetime-step';
import { ReviewStep } from '@/components/booking-steps/review-step';
import { PaymentStep } from '@/components/booking-steps/payment-step';
import { StripeCheckout } from '@/components/stripe-checkout';
import {
  calculateTotalDuration,
  generateDateOptions,
  formatTimeSlots,
  formatTimeForDisplay,
} from '@/utils/booking';
import { getDefaultDate } from '@/utils/date';
import { PaymentMethod } from '@/types/booking';

export default function NewBookingPage() {
  const router = useRouter();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<
    'services' | 'datetime' | 'review' | 'payment' | 'stripe-payment'
  >('services');
  const [createdBooking, setCreatedBooking] = useState<{
    id: string;
    idempotencyKey: string;
  } | null>(null);

  const { data: services } = useServices();
  const createBooking = useCreateBooking({
    onSuccess: (booking) => {
      // If cash payment, redirect immediately
      if (paymentMethod === 'CASH') {
        toast.success('Booking created successfully!', {
          description: `Your appointment is confirmed for ${booking.appointmentDate} at ${formatTimeForDisplay(booking.appointmentTime)}`,
        });
        router.push(`/bookings/${booking.id}`);
      } else {
        // For Stripe payment, store booking and show payment step
        setCreatedBooking({
          id: booking.id,
          idempotencyKey: booking.idempotencyKey,
        });
        setStep('stripe-payment');
      }
    },
    onError: (error) => {
      toast.error('Failed to create booking', {
        description: error.message || 'Please try again or contact support.',
      });
    },
  });

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
      slotsData?.slots ? formatTimeSlots(slotsData.slots, selectedDate) : [],
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

  const handleContinueToReview = () => {
    setStep('review');
  };

  const handleBackToDateTime = () => {
    setStep('datetime');
  };

  const handleContinueToPayment = () => {
    setStep('payment');
  };

  const handleBackToReview = () => {
    setStep('review');
  };

  const handleConfirmBooking = () => {
    if (!selectedDate || !selectedTime || !paymentMethod) {
      toast.error('Missing information', {
        description: 'Please complete all required fields',
      });
      return;
    }

    createBooking.mutate({
      serviceIds: selectedServiceIds,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      paymentMethod: paymentMethod,
    });
  };

  const steps = [
    { id: 'services', label: 'Services', number: 1 },
    { id: 'datetime', label: 'Date & Time', number: 2 },
    { id: 'review', label: 'Review', number: 3 },
    { id: 'payment', label: 'Payment', number: 4 },
  ] as const;

  const getStepIndex = (stepId: string) =>
    steps.findIndex((s) => s.id === stepId);
  const currentStepIndex = getStepIndex(step);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Progress Indicator */}
      <div className="mb-4 rounded-xl bg-white p-4 shadow-xl sm:mb-6 sm:p-6">
        <div className="flex items-center justify-center gap-1.5 sm:gap-3">
          {steps.map((stepItem, index) => {
            const isActive = step === stepItem.id;
            const isCompleted = index < currentStepIndex;

            return (
              <div key={stepItem.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all sm:h-10 sm:w-10 ${
                      isActive
                        ? 'bg-sky-600 text-white shadow-lg shadow-sky-500/30'
                        : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-gray-400 bg-white text-gray-600'
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="h-4 w-4 sm:h-5 sm:w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      stepItem.number
                    )}
                  </div>
                  <div className="ml-1.5 hidden sm:ml-2 sm:block">
                    <p
                      className={`text-xs font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}
                    >
                      {stepItem.label}
                    </p>
                  </div>
                </div>

                {/* Divider - show after all steps except the last one */}
                {index < steps.length - 1 && (
                  <div
                    className={`ml-1.5 h-0.5 w-6 transition-all sm:ml-3 sm:w-12 ${
                      index < currentStepIndex
                        ? 'bg-emerald-500'
                        : 'bg-gray-400'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="p-6">
          {step === 'services' && (
            <ServiceStep
              selectedServiceIds={selectedServiceIds}
              onSelectionChange={setSelectedServiceIds}
              onContinue={handleContinueToDateTime}
            />
          )}

          {step === 'datetime' && (
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
              onConfirm={handleContinueToReview}
            />
          )}

          {step === 'review' && (
            <ReviewStep
              services={services || []}
              selectedServiceIds={selectedServiceIds}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onEditServices={() => setStep('services')}
              onEditDateTime={() => setStep('datetime')}
              onBack={handleBackToDateTime}
              onContinue={handleContinueToPayment}
            />
          )}

          {step === 'payment' && (
            <PaymentStep
              paymentMethod={paymentMethod}
              onSelectPayment={setPaymentMethod}
              onBack={handleBackToReview}
              onConfirm={handleConfirmBooking}
              isLoading={createBooking.isPending}
            />
          )}

          {step === 'stripe-payment' && createdBooking && (
            <StripeCheckout
              bookingId={createdBooking.id}
              idempotencyKey={createdBooking.idempotencyKey}
              onSuccess={() => {
                toast.success('Payment successful!', {
                  description: 'Your booking has been confirmed',
                });
                router.push(`/bookings/${createdBooking.id}`);
              }}
              onCancel={() => {
                toast.info('Payment cancelled', {
                  description: 'You can complete payment later from your bookings',
                });
                router.push(`/bookings/${createdBooking.id}`);
              }}
            />
          )}
        </div>
      </div>
    </main>
  );
}
