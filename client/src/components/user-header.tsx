'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { useLogout } from '@/hooks';
import { useAuthStore } from '@/stores';
import { cn } from '@/utils';

export function UserHeader() {
  const pathname = usePathname();
  const { isLoggingOut } = useAuthStore();
  const { logout } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout('/sign-in');
    setMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-linear-to-br from-sky-500 to-sky-600">
            <svg
              className="h-5 w-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-gray-900 sm:text-xl">
            Salon Booking
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 md:flex">
          <nav className="flex gap-6">
            <Link
              href="/dashboard"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === '/dashboard'
                  ? 'text-sky-600'
                  : 'text-gray-600 hover:text-sky-600'
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/bookings"
              className={cn(
                'text-sm font-medium transition-colors',
                pathname === '/bookings'
                  ? 'text-sky-600'
                  : 'text-gray-600 hover:text-sky-600'
              )}
            >
              My Bookings
            </Link>
          </nav>

          <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
            <UserButton
              appearance={{
                elements: {
                  userButtonPopoverFooter: 'hidden',
                  userButtonPopoverActionButton__signOut: { display: 'none' },
                },
              }}
            />
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex cursor-pointer items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white md:hidden">
          <nav className="flex flex-col space-y-1 px-4 py-3">
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'cursor-pointer rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                pathname === '/dashboard'
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-sky-600'
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/bookings"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'cursor-pointer rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                pathname === '/bookings'
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-sky-600'
              )}
            >
              My Bookings
            </Link>
          </nav>

          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <UserButton
                appearance={{
                  elements: {
                    userButtonPopoverFooter: 'hidden',
                    userButtonPopoverActionButton__signOut: { display: 'none' },
                  },
                }}
              />
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="cursor-pointer rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
