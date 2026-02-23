import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';

interface CancelBookingResponse {
  data: {
    id: string;
    status: string;
    paymentMethod: string;
    cancelledAt: string;
    refundInitiated: boolean;
    refundAmount?: number;
  };
}

type CancelBookingResult = CancelBookingResponse['data'];

type UseCancelBookingOptions = Omit<
  UseMutationOptions<CancelBookingResult, Error, string>,
  'mutationFn'
>;

export function useCancelBooking(options?: UseCancelBookingOptions) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: async (bookingId: string) => {
      const response = await httpClient.post<CancelBookingResponse>(
        `/bookings/${bookingId}/cancel`,
        undefined,
        getToken
      );
      return response.data;
    },
    onSuccess: async (...args) => {
      const [, bookingId] = args;
      await queryClient.invalidateQueries({ queryKey: ['booking', bookingId] });
      await queryClient.invalidateQueries({ queryKey: ['bookings'] });
      await onSuccess?.(...args);
    },
  });
}
