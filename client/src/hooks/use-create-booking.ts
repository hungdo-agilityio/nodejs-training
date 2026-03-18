import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import {
  CreateBookingRequest,
  CreateBookingResponse,
  Booking,
} from '@/types/booking';

type UseCreateBookingOptions = Omit<
  UseMutationOptions<Booking, Error, CreateBookingRequest>,
  'mutationFn'
>;

export function useCreateBooking(options?: UseCreateBookingOptions) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: async (bookingData: CreateBookingRequest) => {
      const response = await httpClient.post<CreateBookingResponse>(
        '/bookings',
        bookingData,
        getToken
      );
      return response.data;
    },
    onSuccess: async (...args) => {
      // Invalidate bookings query to refetch the list
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Call the user's onSuccess if provided
      await onSuccess?.(...args);
    },
  });
}
