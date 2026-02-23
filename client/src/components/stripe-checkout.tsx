'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from './stripe-payment-form';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface StripeCheckoutProps {
  clientSecret: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StripeCheckout({
  clientSecret,
  onSuccess,
  onCancel,
}: StripeCheckoutProps) {
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
