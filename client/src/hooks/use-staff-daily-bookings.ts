import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { StaffDailyResponse, StaffDailyBooking } from '@/types/staff';
import { computeEndsAt } from '@/utils';

interface ApiDailyBookingsResponse {
  data: Array<{
    id: string;
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
      phoneNumber: string | null;
    };
    services: Array<{
      id: string;
      name: string;
      price: number;
      durationMinutes: number;
    }>;
    appointmentTime: string;
    status: string;
    paymentMethod: string;
    totalPrice: number;
    totalDurationMinutes: number;
    notes: string | null;
  }>;
  summary: {
    totalBookings: number;
    totalRevenue: number;
    byStatus: Record<string, number>;
  };
  date: string;
}

function transformApiResponse(
  apiResponse: ApiDailyBookingsResponse
): StaffDailyResponse {
  const bookings: StaffDailyBooking[] = apiResponse.data.map((booking) => {
    // Calculate end time
    const endsAt = computeEndsAt(
      booking.appointmentTime,
      booking.totalDurationMinutes
    );

    // Format customer name
    const customerName =
      [booking.customer.firstName, booking.customer.lastName]
        .filter(Boolean)
        .join(' ') || 'Unknown';

    return {
      id: booking.id,
      services: booking.services.map((s) => ({
        name: s.name,
        durationMinutes: s.durationMinutes,
      })),
      appointmentTime: booking.appointmentTime,
      endsAt,
      customer: {
        name: customerName,
        email: booking.customer.email,
      },
      status: booking.status as StaffDailyBooking['status'],
      paymentMethod:
        booking.paymentMethod as StaffDailyBooking['paymentMethod'],
      totalPrice: booking.totalPrice,
      totalDurationMinutes: booking.totalDurationMinutes,
    };
  });

  // Get day name from date
  const dateObj = new Date(apiResponse.date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  // Calculate byPaymentMethod from bookings
  const byPaymentMethod: Record<string, number> = {};
  for (const booking of bookings) {
    byPaymentMethod[booking.paymentMethod] =
      (byPaymentMethod[booking.paymentMethod] ?? 0) + 1;
  }

  return {
    date: apiResponse.date,
    dayName,
    bookings,
    summary: {
      total: apiResponse.summary.totalBookings,
      totalRevenue: apiResponse.summary.totalRevenue,
      byStatus: apiResponse.summary.byStatus,
      byPaymentMethod,
    },
  };
}

export function useStaffDailyBookings(
  date: string,
  options?: Omit<
    UseQueryOptions<StaffDailyResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  const { getToken } = useAuth();

  return useQuery<StaffDailyResponse, Error>({
    queryKey: ['staff-bookings', date],
    queryFn: async () => {
      const response = await httpClient.get<ApiDailyBookingsResponse>(
        `/bookings/daily?date=${date}`,
        getToken
      );
      return transformApiResponse(response);
    },
    ...options,
  });
}
