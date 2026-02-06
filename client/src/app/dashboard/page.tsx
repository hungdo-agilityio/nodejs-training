'use client';

import { useClerk, UserButton } from '@clerk/nextjs';
import { useMe } from '@/hooks';
import { useAuthStore } from '@/stores';

export default function Dashboard() {
  const { signOut } = useClerk();
  const { data, isLoading, error } = useMe();
  const { isLoggingOut, setLoggingOut } = useAuthStore();

  const handleLogout = () => {
    setLoggingOut(true);
    signOut({ redirectUrl: '/sign-in' }).finally(() => {
      setLoggingOut(false);
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold dark:text-white">Salon Booking</h1>
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
          Dashboard
        </h2>

        <div className="rounded-lg bg-white p-6 shadow dark:bg-zinc-900">
          <h3 className="mb-4 text-lg font-medium dark:text-white">
            User Info
          </h3>

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
