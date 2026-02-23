import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { CompleteResponse } from '@/types/staff';

interface CompleteApiResponse {
  data: CompleteResponse;
}

type UseCompleteBookingOptions = Omit<
  UseMutationOptions<CompleteResponse, Error, string>,
  'mutationFn'
>;

export function useCompleteBooking(options?: UseCompleteBookingOptions) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: async (bookingId: string) => {
      const response = await httpClient.post<CompleteApiResponse>(
        `/bookings/${bookingId}/complete`,
        undefined,
        getToken
      );
      return response.data;
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ['staff-bookings'] });
      await onSuccess?.(...args);
    },
  });
}
