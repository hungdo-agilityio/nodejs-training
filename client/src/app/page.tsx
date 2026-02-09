import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white">
      {/* Header */}
      <header className="border-b border-sky-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-sky-900">Salon Booking</h1>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/bookings"
                className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-7xl px-4 py-16">
        <div className="text-center">
          <h2 className="mb-4 text-5xl font-bold tracking-tight text-sky-900">
            Welcome to Our Salon
          </h2>
          <p className="mb-8 text-xl text-slate-600">
            Book your appointment online and enjoy professional salon services
          </p>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-lg bg-sky-500 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-sky-600">
                Get Started
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/bookings"
              className="inline-block rounded-lg bg-sky-500 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-sky-600"
            >
              Book Now
            </Link>
          </SignedIn>
        </div>

        {/* Features */}
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-4xl">📅</div>
            <h3 className="mb-2 text-lg font-semibold text-sky-900">
              Easy Booking
            </h3>
            <p className="text-slate-600">
              Book your appointments online in just a few clicks
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-4xl">✂️</div>
            <h3 className="mb-2 text-lg font-semibold text-sky-900">
              Professional Service
            </h3>
            <p className="text-slate-600">
              Experienced stylists and quality salon services
            </p>
          </div>

          <div className="rounded-lg bg-white p-6 shadow-md">
            <div className="mb-4 text-4xl">💳</div>
            <h3 className="mb-2 text-lg font-semibold text-sky-900">
              Flexible Payment
            </h3>
            <p className="text-slate-600">
              Pay online or at the salon - your choice
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-sky-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-600">
          © 2026 Salon Booking. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
