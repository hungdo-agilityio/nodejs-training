'use client';

import { useAuthStore } from '@/stores';
import { Spinner } from './spinner';

export function GlobalLoading() {
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

  if (!isLoggingOut) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-8 shadow-xl dark:bg-zinc-900">
        <Spinner size="lg" className="text-zinc-900 dark:text-white" />
        <p className="text-sm font-medium text-zinc-900 dark:text-white">
          Logging out...
        </p>
      </div>
    </div>
  );
}
