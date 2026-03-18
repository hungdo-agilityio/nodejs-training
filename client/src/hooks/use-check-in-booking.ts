import {
  useMutation,
  UseMutationOptions,
  useQueryClient,
} from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { CheckInResponse } from '@/types/staff';

interface CheckInApiResponse {
  data: CheckInResponse;
}

type UseCheckInBookingOptions = Omit<
  UseMutationOptions<CheckInResponse, Error, string>,
  'mutationFn'
>;

export function useCheckInBooking(options?: UseCheckInBookingOptions) {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const { onSuccess, ...restOptions } = options || {};

  return useMutation({
    ...restOptions,
    mutationFn: async (bookingId: string) => {
      const response = await httpClient.post<CheckInApiResponse>(
        `/bookings/${bookingId}/check-in`,
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
