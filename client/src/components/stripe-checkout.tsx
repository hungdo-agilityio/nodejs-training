'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { toast } from 'sonner';
import { useAuthorizePayment } from '@/hooks';
import { StripePaymentForm } from './stripe-payment-form';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeCheckoutProps {
  bookingId: string;
  idempotencyKey: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckout({
  bookingId,
  idempotencyKey,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const authorizePayment = useAuthorizePayment({
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast.error('Failed to initialize payment', {
        description: error.message || 'Please try again later',
      });
    },
  });

  useEffect(() => {
    // Authorize payment when component mounts
    authorizePayment.mutate({
      bookingId,
      idempotencyKey,
    });
  }, []);

  if (authorizePayment.isPending) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg
            className="mx-auto h-8 w-8 animate-spin text-sky-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-sm text-gray-600">
            Initializing secure payment...
          </p>
        </div>
      </div>
    );
  }

  if (authorizePayment.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <h3 className="text-sm font-semibold text-red-800">
          Failed to initialize payment
        </h3>
        <p className="mt-1 text-sm text-red-700">
          {authorizePayment.error?.message || 'Please try again later'}
        </p>
        <button
          onClick={onCancel}
          className="mt-4 text-sm font-medium text-red-800 hover:text-red-900"
        >
          Go back
        </button>
      </div>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#0284c7',
      },
    },
  };

  return (
    <div>
      <h2 className="mb-6 text-lg font-semibold text-gray-900">
        Payment Details
      </h2>
      <Elements stripe={stripePromise} options={options}>
        <StripePaymentForm onSuccess={onSuccess} onCancel={onCancel} />
      </Elements>
    </div>
  );
}
