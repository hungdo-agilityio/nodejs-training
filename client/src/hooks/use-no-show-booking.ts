import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { NoShowResponse } from '@/types/staff';

interface NoShowApiResponse {
  data: NoShowResponse;
}

type UseNoShowBookingOptions = Omit<
  UseMutationOptions<NoShowResponse, Error, string>,
  'mutationFn'
>;

export function useNoShowBooking(options?: UseNoShowBookingOptions) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: async (bookingId: string) => {
      const response = await httpClient.post<NoShowApiResponse>(
        `/bookings/${bookingId}/no-show`,
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
