'use client';

import { useMe } from '@/hooks';
import { Spinner } from '@/components';
import Link from 'next/link';

export default function BookingsPage() {
  const { data, isLoading } = useMe();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="text-gray-900" />
          </div>
        )}

        {data && (
          <div className="rounded-2xl bg-white p-16 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-8 w-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">No appointments yet</h2>
            <p className="mt-3 text-base text-gray-600">
              Start your beauty journey by booking your first appointment
            </p>
            <Link
              href="/bookings/new"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gray-900 px-8 py-3 text-base font-semibold text-white transition-all hover:bg-gray-800"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Book Your First Appointment
            </Link>
          </div>
        )}
      </main>
  );
}
