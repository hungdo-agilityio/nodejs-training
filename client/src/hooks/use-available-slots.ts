import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { SlotResponse } from '@/types/slot';

interface SlotsParams {
  date: string;
  serviceIds: string[];
}

interface SlotsApiResponse {
  data: SlotResponse;
}

export function useAvailableSlots(params: SlotsParams, enabled = true) {
  const { getToken } = useAuth();

  const queryParams = new URLSearchParams({
    date: params.date,
    service_ids: params.serviceIds.join(','),
  });

  return useQuery({
    queryKey: ['slots', params.date, params.serviceIds],
    queryFn: async () => {
      const response = await httpClient.get<SlotsApiResponse>(
        `/slots?${queryParams.toString()}`,
        getToken
      );
      return response.data;
    },
    enabled: enabled && !!params.date && params.serviceIds.length > 0,
  });
}
