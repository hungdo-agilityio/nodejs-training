'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks';
import { Spinner } from './spinner';

type UserRole = 'USER' | 'STAFF' | 'ADMIN';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const router = useRouter();
  const { data, isLoading } = useMe();

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

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
