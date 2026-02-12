import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { CreateBookingRequest, CreateBookingResponse, Booking } from '@/types/booking';

type UseCreateBookingOptions = Omit<
  UseMutationOptions<Booking, Error, CreateBookingRequest>,
  'mutationFn'
>;

export function useCreateBooking(options?: UseCreateBookingOptions) {
  const { getToken } = useAuth();

  return useMutation({
    mutationFn: async (bookingData: CreateBookingRequest) => {
      const response = await httpClient.post<CreateBookingResponse>(
        '/bookings',
        bookingData,
        getToken
      );
      return response.data;
    },
    ...options,
  });
}
