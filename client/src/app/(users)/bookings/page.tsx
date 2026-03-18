'use client';

import { useState } from 'react';
import { useGetBookings } from '@/hooks';
import { Spinner } from '@/components';
import Link from 'next/link';
import { formatTimeForDisplay } from '@/utils/booking';
import { BookingStatus, PaymentMethod } from '@/types/booking';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/ui/pagination';

const statusColors: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  CONFIRMED: 'bg-emerald-100 text-emerald-700',
  AUTHORIZED: 'bg-blue-100 text-blue-700',
  CHECKED_IN: 'bg-purple-100 text-purple-700',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-500',
  DONE: 'bg-green-100 text-green-700',
  NO_SHOW: 'bg-gray-100 text-gray-700',
};

const statusLabels: Record<BookingStatus, string> = {
  PENDING_PAYMENT: 'Pending',
  CONFIRMED: 'Confirmed',
  AUTHORIZED: 'Payment Held',
  CHECKED_IN: 'Checked In',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  DONE: 'Done',
  NO_SHOW: 'No Show',
};

type TabOption = 'upcoming' | 'past' | 'all';

const TAB_PARAMS: Record<
  TabOption,
  {
    startDate?: string;
    endDate?: string;
    sortBy: 'upcoming' | 'past' | 'recent';
  }
> = {
  upcoming: {
    startDate: new Date().toISOString().split('T')[0],
    sortBy: 'upcoming',
  },
  past: {
    endDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    sortBy: 'past',
  },
  all: { sortBy: 'recent' },
};

const TAB_LABELS: Record<TabOption, string> = {
  upcoming: 'Upcoming',
  past: 'Past',
  all: 'All',
};

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabOption>('upcoming');
  const [statusFilter, setStatusFilter] = useState<BookingStatus | ''>('');
  const [paymentFilter, setPaymentFilter] = useState<PaymentMethod | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetBookings({
    status: statusFilter || undefined,
    paymentMethod: paymentFilter || undefined,
    ...TAB_PARAMS[activeTab],
    page,
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <Link
          href="/bookings/new"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Booking
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex w-fit gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1">
        {(Object.keys(TAB_LABELS) as TabOption[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setPage(1);
            }}
            className={`cursor-pointer rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Select
          value={statusFilter || 'ALL'}
          onValueChange={(value) => {
            setStatusFilter(value === 'ALL' ? '' : (value as BookingStatus));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-45 cursor-pointer border-gray-200 bg-white hover:border-gray-300">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="AUTHORIZED">Payment Held</SelectItem>
            <SelectItem value="CHECKED_IN">Checked In</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="NO_SHOW">No Show</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={paymentFilter || 'ALL'}
          onValueChange={(value) => {
            setPaymentFilter(value === 'ALL' ? '' : (value as PaymentMethod));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-50 cursor-pointer border-gray-200 bg-white hover:border-gray-300">
            <SelectValue placeholder="All Payment Methods" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Payment Methods</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="STRIPE">Card</SelectItem>
          </SelectContent>
        </Select>

        {(statusFilter || paymentFilter) && (
          <button
            onClick={() => {
              setStatusFilter('');
              setPaymentFilter('');
              setPage(1);
            }}
            className="cursor-pointer text-sm font-medium text-red-600 hover:text-red-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner className="text-gray-900" />
        </div>
      )}

      {!isLoading && data && data.data.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No bookings found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {statusFilter || paymentFilter
              ? 'Try adjusting your filters'
              : 'Get started by creating your first booking'}
          </p>
        </div>
      )}

      {!isLoading && data && data.data.length > 0 && (
        <>
          <div className="space-y-3">
            {data.data.map((booking) => (
              <Link
                key={booking.id}
                href={`/bookings/${booking.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[booking.status]}`}
                      >
                        {statusLabels[booking.status]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {booking.paymentMethod === 'CASH' ? 'Cash' : 'Card'}
                      </span>
                    </div>

                    <div>
                      <p className="font-semibold text-gray-900">
                        {new Date(booking.appointmentDate).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                        {' • '}
                        {formatTimeForDisplay(booking.appointmentTime)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.servicesCount}{' '}
                        {booking.servicesCount === 1 ? 'service' : 'services'} •{' '}
                        {booking.totalDurationMinutes} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${booking.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {data.meta.totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    className={
                      page === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>

                {Array.from(
                  { length: data.meta.totalPages },
                  (_, i) => i + 1
                ).map((pageNum) => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                      }}
                      isActive={pageNum === page}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < data.meta.totalPages) setPage(page + 1);
                    }}
                    className={
                      page === data.meta.totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </main>
  );
}
