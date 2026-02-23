'use client';

import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { useLogout } from '@/hooks';
import { useAuthStore } from '@/stores';
import { Button } from '@/ui/button';

export function StaffHeader() {
  const { isLoggingOut } = useAuthStore();
  const { logout } = useLogout();

  const handleLogout = () => {
    logout('/sign-in');
  };

  return (
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
          <UserButton
            appearance={{
              elements: {
                userButtonPopoverFooter: 'hidden',
                userButtonPopoverActionButton__signOut: { display: 'none' },
              },
            }}
          />
          <Button
            variant="staff-danger"
            size="sm"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
