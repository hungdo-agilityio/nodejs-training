'use client';

import { UserButton } from '@clerk/nextjs';
import { useMe, useLogout } from '@/hooks';
import { useAuthStore } from '@/stores';

export default function StaffDashboard() {
  const { data, isLoading, error } = useMe();
  const { isLoggingOut } = useAuthStore();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout('/sign-in');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold dark:text-white">Salon Booking</h1>
            <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
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
        <h2 className="mb-6 text-2xl font-semibold dark:text-white">
          Staff Dashboard
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-medium dark:text-white">
              Today&apos;s Bookings
            </h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-medium dark:text-white">
              Pending
            </h3>
            <p className="text-3xl font-bold text-yellow-600">0</p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
            <h3 className="mb-2 text-lg font-medium dark:text-white">
              Completed
            </h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
        </div>

        <div className="mt-8 rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-medium dark:text-white">User Info</h3>

          {isLoading && (
            <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
          )}

          {error && <p className="text-red-500">Error: {error.message}</p>}

          {data && (
            <pre className="overflow-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-800 dark:text-white">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
