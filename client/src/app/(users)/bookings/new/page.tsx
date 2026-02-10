'use client';

import { useState } from 'react';
import { UserButton } from '@clerk/nextjs';
import { useLogout } from '@/hooks';
import { useAuthStore } from '@/stores';
import { ServiceSelection } from '@/components/service-selection';
import Link from 'next/link';

export default function NewBookingPage() {
  const { isLoggingOut } = useAuthStore();
  const { logout } = useLogout();
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

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
              <Link href="/bookings" className="text-sm text-slate-600 hover:text-sky-600">
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
          <Link
            href="/bookings"
            className="text-sm text-sky-600 hover:text-sky-700"
          >
            ← Back to My Bookings
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-sky-900">
            Create New Booking
          </h1>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Select Services</h2>
            <p className="mt-1 text-sm text-gray-600">
              Choose one or more services for your booking
            </p>
          </div>

          <ServiceSelection
            selectedServiceIds={selectedServiceIds}
            onSelectionChange={setSelectedServiceIds}
          />

          {selectedServiceIds.length > 0 && (
            <div className="mt-6 flex items-center justify-between border-t pt-6">
              <div className="text-sm text-gray-600">
                {selectedServiceIds.length} service{selectedServiceIds.length > 1 ? 's' : ''} selected
              </div>
              <button
                className="rounded-lg bg-sky-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
              >
                Continue to Date & Time
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
