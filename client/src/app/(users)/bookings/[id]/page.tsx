'use client';

import { useGetBooking } from '@/hooks';
import { Spinner } from '@/components';
import Link from 'next/link';
import { use } from 'react';
import { formatTimeForDisplay } from '@/utils/booking';
import { BookingStatus } from '@/types/booking';

const statusColors: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  AUTHORIZED: 'bg-blue-100 text-blue-700',
  CHECKED_IN: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
};

const statusLabels: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'Pending Payment',
  CONFIRMED: 'Confirmed',
  AUTHORIZED: 'Authorized',
  CHECKED_IN: 'Checked In',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

export default function BookingDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: booking, isLoading, error } = useGetBooking(id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-6">
      <div className="mb-6">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Bookings
        </Link>
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Booking Details</h1>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="text-gray-900" />
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-800">Failed to load booking details</p>
          <p className="mt-1 text-sm text-red-600">{error.message}</p>
        </div>
      )}

      {booking && (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-medium ${statusColors[booking.status]}`}>
                  {statusLabels[booking.status]}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="mt-1 font-medium text-gray-900">
                  {booking.paymentMethod === 'CASH' ? 'Cash at salon' : 'Card'}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(booking.appointmentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium text-gray-900">
                    {formatTimeForDisplay(booking.appointmentTime)} ({booking.totalDurationMinutes} minutes)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services</h2>
            <div className="space-y-3">
              {booking.services.map((service, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{service.name}</p>
                    <p className="text-sm text-gray-500">{service.durationMinutes} minutes</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">${service.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-lg font-semibold text-gray-900">Total</p>
              <p className="text-2xl font-bold text-gray-900">${booking.totalPrice.toFixed(2)}</p>
            </div>
          </div>

          {/* Notes */}
          {booking.notes && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notes</h2>
              <p className="text-gray-700">{booking.notes}</p>
            </div>
          )}

          {/* Booking Info */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              Booking ID: <span className="font-mono text-gray-900">{booking.id}</span>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Created: {new Date(booking.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
