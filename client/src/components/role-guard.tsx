'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe, useLogout } from '@/hooks';
import { Spinner } from './spinner';

type UserRole = 'USER' | 'STAFF' | 'ADMIN';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { data, isLoading, error } = useMe();
  const { logout } = useLogout();

  // Extract the actual role value - only changes when role changes
  const userRole = data?.role as UserRole | undefined;

  useEffect(() => {
    // Only redirect if we have a role and it's not allowed
    if (userRole && !allowedRoles.includes(userRole)) {
      const destination =
        userRole === 'STAFF' || userRole === 'ADMIN' ? '/staff' : '/bookings';
      router.replace(destination);
    }
    // Don't include allowedRoles - it won't change during component lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <Spinner size="lg" className="text-sky-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sky-50">
        <div className="mx-4 w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">
            Unable to load account
          </h2>
          <p className="mb-6 text-sm text-gray-600">
            {error.message || 'Something went wrong. Please try again.'}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="cursor-pointer rounded-lg bg-sky-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
            >
              Try again
            </button>
            <button
              onClick={() => logout('/sign-in')}
              className="cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
