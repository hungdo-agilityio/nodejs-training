import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-gray-900">Salon Booking</span>
          </Link>
          <nav className="flex items-center gap-6">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-500/30">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-lg bg-sky-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-sky-700 hover:shadow-lg hover:shadow-sky-500/30"
              >
                Dashboard
              </Link>
            </SignedIn>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-blue-50 px-6 py-24 sm:py-32">
          <div className="absolute inset-0 bg-grid-gray-900/[0.04] bg-[size:20px_20px]" />
          <div className="relative mx-auto max-w-7xl">
            <div className="text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-medium text-sky-800">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
                </span>
                Now accepting online bookings
              </div>
              <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
                Your Perfect Look,
                <br />
                <span className="bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  Just a Click Away
                </span>
              </h1>
              <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-600 sm:text-xl">
                Book appointments with top-rated stylists in seconds. No phone calls, no hassle—just beautiful results.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="group relative rounded-xl bg-sky-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-500/40">
                      Get Started Free
                      <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Link
                    href="/bookings/new"
                    className="group relative rounded-xl bg-sky-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition-all hover:bg-sky-700 hover:shadow-xl hover:shadow-sky-500/40"
                  >
                    Book Appointment
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </SignedIn>
                <Link
                  href="#features"
                  className="rounded-xl border border-gray-300 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white px-6 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need to book with confidence
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600">
                Modern booking experience designed for your convenience
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-sky-500 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition-all group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Real-Time Availability
                </h3>
                <p className="text-gray-600">
                  See available time slots instantly and book your preferred time without waiting for confirmation calls.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-sky-500 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition-all group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Instant Confirmation
                </h3>
                <p className="text-gray-600">
                  Get immediate booking confirmation with all details sent directly to your email and phone.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-sky-500 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition-all group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Flexible Payment
                </h3>
                <p className="text-gray-600">
                  Pay securely online or choose to pay at the salon. Multiple payment options for your convenience.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-sky-500 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition-all group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Easy Rescheduling
                </h3>
                <p className="text-gray-600">
                  Plans changed? Reschedule or cancel appointments easily through your dashboard with just a few taps.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-sky-500 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition-all group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Smart Reminders
                </h3>
                <p className="text-gray-600">
                  Never miss an appointment with automated email and SMS reminders sent before your booking.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-sky-500 hover:shadow-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-100 text-sky-600 transition-all group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  Service History
                </h3>
                <p className="text-gray-600">
                  Access your complete booking history and favorite services for quick rebooking anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-br from-sky-600 to-blue-700 px-6 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-white sm:text-4xl">
              Ready to experience hassle-free booking?
            </h2>
            <p className="mb-10 text-lg text-sky-100">
              Join thousands of satisfied customers who trust us with their beauty needs.
            </p>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-sky-600 shadow-xl transition-all hover:bg-gray-50 hover:shadow-2xl">
                  Create Free Account
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/bookings/new"
                className="inline-block rounded-xl bg-white px-8 py-4 text-base font-semibold text-sky-600 shadow-xl transition-all hover:bg-gray-50 hover:shadow-2xl"
              >
                Book Your Appointment
              </Link>
            </SignedIn>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-600">
              © 2026 Salon Booking. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-gray-600 hover:text-sky-600">Privacy</Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-sky-600">Terms</Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-sky-600">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
