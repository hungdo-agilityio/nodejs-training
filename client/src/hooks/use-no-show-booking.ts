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

interface NoShowParams {
  bookingId: string;
  notes?: string;
}

type UseNoShowBookingOptions = Omit<
  UseMutationOptions<NoShowResponse, Error, NoShowParams>,
  'mutationFn'
>;

export function useNoShowBooking(options?: UseNoShowBookingOptions) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: async ({ bookingId, notes }: NoShowParams) => {
      const response = await httpClient.post<NoShowApiResponse>(
        `/bookings/${bookingId}/no-show`,
        notes ? { notes } : undefined,
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
