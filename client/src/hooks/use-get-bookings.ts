import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { GetBookingsResponse, GetBookingsParams } from '@/types/booking';

export function useGetBookings(
  params?: GetBookingsParams,
  options?: Omit<
    UseQueryOptions<GetBookingsResponse, Error>,
    'queryKey' | 'queryFn'
  >
) {
  const { getToken } = useAuth();

  return useQuery<GetBookingsResponse, Error>({
    queryKey: ['bookings', params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      if (params?.status) queryParams.append('status', params.status);
      if (params?.paymentMethod)
        queryParams.append('payment_method', params.paymentMethod);
      if (params?.serviceId) queryParams.append('service_id', params.serviceId);
      if (params?.date) queryParams.append('date', params.date);
      if (params?.startDate) queryParams.append('start_date', params.startDate);
      if (params?.endDate) queryParams.append('end_date', params.endDate);
      if (params?.sortBy) queryParams.append('sort_by', params.sortBy);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const url = `/bookings${queryString ? `?${queryString}` : ''}`;

      const response = await httpClient.get<GetBookingsResponse>(url, getToken);
      return response;
    },
    ...options,
  });
}
