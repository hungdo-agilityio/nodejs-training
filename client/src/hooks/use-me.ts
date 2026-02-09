import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';

type UserRole = 'USER' | 'STAFF' | 'ADMIN';

interface MeResponse {
  data: {
    userId: string;
    sessionId: string;
    role: UserRole;
  };
}

export function useMe() {
  const { getToken, isSignedIn, userId } = useAuth();

  return useQuery({
    queryKey: ['me', userId],
    queryFn: async (): Promise<MeResponse> => {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return response.json();
    },
    enabled: isSignedIn && !!userId,
  });
}
