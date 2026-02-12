'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/hooks';
import { Spinner } from '@/components';

export default function CallbackPage() {
  const router = useRouter();
  const { data, isLoading } = useMe();

  useEffect(() => {
    if (!isLoading && data) {
      const role = data.role;

      // Navigate based on role from database
      if (role === 'STAFF' || role === 'ADMIN') {
        router.replace('/staff');
      } else {
        router.replace('/bookings');
      }
    }
  }, [data, isLoading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-sky-50">
      <div className="text-center">
        <Spinner size="lg" className="text-sky-500" />
        <p className="mt-4 text-slate-600">Redirecting...</p>
      </div>
    </div>
  );
}
