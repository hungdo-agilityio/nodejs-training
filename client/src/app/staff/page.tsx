'use client';

import { UserButton } from '@clerk/nextjs';
import { useMe, useLogout } from '@/hooks';
import { useAuthStore } from '@/stores';
import { Spinner } from '@/components';
import Link from 'next/link';

export default function StaffDashboard() {
  const { data, isLoading, error } = useMe();
  const { isLoggingOut } = useAuthStore();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout('/sign-in');
  };

  return (
    <div className="min-h-screen bg-sky-50">
      <header className="border-b border-sky-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-sky-900">
              Salon Booking
            </Link>
            <span className="rounded-full bg-sky-100 px-2 py-1 text-xs font-medium text-sky-800">
              Staff
            </span>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="mb-6 text-2xl font-semibold text-sky-900">
          Staff Dashboard
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-lg font-medium text-sky-900">
              Today&apos;s Bookings
            </h3>
            <p className="text-3xl font-bold text-sky-600">0</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-lg font-medium text-sky-900">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">0</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-2 text-lg font-medium text-sky-900">
              Completed
            </h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
          <h3 className="mb-4 text-lg font-medium text-sky-900">User Info</h3>

          {isLoading && (
            <div className="flex justify-center">
              <Spinner className="text-sky-500" />
            </div>
          )}

          {error && <p className="text-red-500">Error: {error.message}</p>}

          {data && (
            <pre className="overflow-auto rounded-lg bg-sky-50 p-4 text-sm text-slate-800">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
