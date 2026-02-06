import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

interface MeResponse {
  data: {
    userId: string;
    sessionId: string;
  };
}

export function useMe() {
  const { getToken, isSignedIn } = useAuth();

  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<MeResponse> => {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return response.json();
    },
    enabled: isSignedIn,
  });
}
