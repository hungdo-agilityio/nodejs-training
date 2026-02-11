'use client';

import { useMe } from '@/hooks';
import { Spinner } from '@/components';
import Link from 'next/link';

export default function Dashboard() {
  const { data, isLoading, error } = useMe();

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Welcome back{data?.firstName ? `, ${data.firstName}` : ''}!
        </h1>
        <p className="text-gray-600">Manage your bookings and profile</p>
      </div>

      {/* Quick Actions */}
      <div className="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/bookings/new"
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-linear-to-br from-sky-500 to-blue-600 p-6 transition-all hover:shadow-2xl hover:shadow-sky-500/30"
        >
          <div className="relative z-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">
              New Booking
            </h3>
            <p className="text-sm text-sky-100">
              Schedule your next appointment
            </p>
            <div className="mt-4 flex items-center text-sm font-medium text-white">
              Book now
              <svg
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
        </Link>

        <Link
          href="/bookings"
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-sky-500 hover:shadow-xl"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">
            My Bookings
          </h3>
          <p className="text-sm text-gray-600">View and manage appointments</p>
          <div className="mt-4 flex items-center text-sm font-medium text-sky-600">
            View all
            <svg
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>

        <Link
          href="/dashboard"
          className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 transition-all hover:border-sky-500 hover:shadow-xl"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-xl font-semibold text-gray-900">Profile</h3>
          <p className="text-sm text-gray-600">Update your information</p>
          <div className="mt-4 flex items-center text-sm font-medium text-sky-600">
            Manage
            <svg
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </Link>
      </div>

      {/* User Info Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Account Information
          </h2>
          {data && (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Active
            </span>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="text-sky-500" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-900">
              Failed to load account information
            </p>
            <p className="mt-1 text-xs text-red-700">{error.message}</p>
          </div>
        )}

        {data && (
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-500">
                First Name
              </label>
              <p className="text-base font-medium text-gray-900">
                {data.firstName || 'N/A'}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-500">
                Last Name
              </label>
              <p className="text-base font-medium text-gray-900">
                {data.lastName || 'N/A'}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-500">
                Email
              </label>
              <p className="text-base font-medium text-gray-900">
                {data.email || 'N/A'}
              </p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-500">
                Phone
              </label>
              <p className="text-base font-medium text-gray-900">
                {data.phoneNumber || 'Not set'}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
