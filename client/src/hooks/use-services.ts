import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';
import { Service } from '@/types/service';

interface ServicesResponse {
  data: Service[];
}

export function useServices() {
  const { getToken } = useAuth();

  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await httpClient.get<ServicesResponse>(
        '/services',
        getToken
      );
      return response.data;
    },
  });
}
