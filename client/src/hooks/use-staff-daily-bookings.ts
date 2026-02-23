import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { StaffDailyResponse } from '@/types/staff';

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
      const response = await httpClient.get<StaffDailyResponse>(
        `/staff/bookings/daily?date=${date}`,
        getToken
      );
      return response;
    },
    ...options,
  });
}
