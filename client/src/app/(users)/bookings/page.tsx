'use client';

import { UserButton } from '@clerk/nextjs';
import { useMe, useLogout } from '@/hooks';
import { useAuthStore } from '@/stores';
import { Spinner } from '@/components';
import Link from 'next/link';

export default function BookingsPage() {
  const { data, isLoading } = useMe();
  const { isLoggingOut } = useAuthStore();
  const { logout } = useLogout();

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
                className="text-sm font-medium text-sky-600"
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
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-sky-900">My Bookings</h1>
          <Link
            href="/bookings/new"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
          >
            New Booking
          </Link>
        </div>

        {isLoading && (
          <div className="flex justify-center">
            <Spinner className="text-sky-500" />
          </div>
        )}

        {data && (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <p className="mb-4 text-slate-600">
              Welcome back! You&apos;re signed in as{' '}
              <span className="font-medium text-sky-600">{data.data.role}</span>
            </p>
            <div className="text-center text-slate-500">
              <p className="text-lg">📅</p>
              <p className="mt-2">No bookings yet</p>
              <p className="mt-1 text-sm">
                Click &quot;New Booking&quot; to schedule your first appointment
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
