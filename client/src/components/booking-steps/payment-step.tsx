'use client';

import { Button } from '@/ui/button';

interface PaymentStepProps {
  paymentMethod: 'CASH' | 'STRIPE' | null;
  onSelectPayment: (method: 'CASH' | 'STRIPE') => void;
  onBack: () => void;
  onConfirm: () => void;
}

export function PaymentStep({
  paymentMethod,
  onSelectPayment,
  onBack,
  onConfirm,
}: PaymentStepProps) {
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
        <h2 className="text-base font-semibold text-gray-900">Choose Payment Method</h2>
      </div>

      <div className="space-y-4">
        {/* Cash Payment Option */}
        <button
          onClick={() => onSelectPayment('CASH')}
          className={`group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 bg-white p-6 text-left transition-all ${
            paymentMethod === 'CASH'
              ? 'border-sky-500 shadow-xl shadow-sky-500/20'
              : 'border-gray-200 shadow-lg hover:border-sky-300 hover:shadow-xl'
          }`}
        >
          {paymentMethod === 'CASH' && (
            <div className="absolute left-0 top-0 h-full w-1 bg-sky-500" />
          )}

          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all ${
              paymentMethod === 'CASH' ? 'bg-sky-100' : 'bg-gray-100'
            }`}>
              <svg
                className={`h-6 w-6 ${paymentMethod === 'CASH' ? 'text-sky-600' : 'text-gray-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                paymentMethod === 'CASH' ? 'text-sky-900' : 'text-gray-900'
              }`}>
                Pay with Cash
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Pay at the salon after your service
              </p>
            </div>

            <div
              className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                paymentMethod === 'CASH'
                  ? 'border-sky-500 bg-sky-500 scale-110'
                  : 'border-gray-500 bg-white group-hover:border-sky-400'
              }`}
            >
              {paymentMethod === 'CASH' && (
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        </button>

        {/* Stripe Payment Option */}
        <button
          onClick={() => onSelectPayment('STRIPE')}
          className={`group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 bg-white p-6 text-left transition-all ${
            paymentMethod === 'STRIPE'
              ? 'border-sky-500 shadow-xl shadow-sky-500/20'
              : 'border-gray-200 shadow-lg hover:border-sky-300 hover:shadow-xl'
          }`}
        >
          {paymentMethod === 'STRIPE' && (
            <div className="absolute left-0 top-0 h-full w-1 bg-sky-500" />
          )}

          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-lg transition-all ${
              paymentMethod === 'STRIPE' ? 'bg-sky-100' : 'bg-gray-100'
            }`}>
              <svg
                className={`h-6 w-6 ${paymentMethod === 'STRIPE' ? 'text-sky-600' : 'text-gray-600'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                paymentMethod === 'STRIPE' ? 'text-sky-900' : 'text-gray-900'
              }`}>
                Pay with Card
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Pay securely online with Stripe
              </p>
            </div>

            <div
              className={`flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all ${
                paymentMethod === 'STRIPE'
                  ? 'border-sky-500 bg-sky-500 scale-110'
                  : 'border-gray-500 bg-white group-hover:border-sky-400'
              }`}
            >
              {paymentMethod === 'STRIPE' && (
                <svg
                  className="h-4 w-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
        </button>
      </div>

      {paymentMethod && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <Button onClick={onConfirm} className="w-full bg-gray-900 hover:bg-gray-800" size="lg">
            Confirm Booking
          </Button>
        </div>
      )}
    </>
  );
}
