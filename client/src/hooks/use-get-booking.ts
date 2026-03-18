import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { BookingDetail } from '@/types/booking';

interface GetBookingResponse {
  data: BookingDetail;
}

export function useGetBooking(
  bookingId: string,
  options?: Omit<UseQueryOptions<BookingDetail, Error>, 'queryKey' | 'queryFn'>
) {
  const { getToken } = useAuth();

  return useQuery<BookingDetail, Error>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const response = await httpClient.get<GetBookingResponse>(
        `/bookings/${bookingId}`,
        getToken
      );
      return response.data;
    },
    ...options,
  });
}
