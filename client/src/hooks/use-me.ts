import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/nextjs';
import { httpClient } from '@/lib/http-client';

export type UserRole = 'USER' | 'STAFF' | 'ADMIN';

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface MeResponse {
  data: User;
}

export function useMe() {
  const { getToken, isSignedIn, userId } = useAuth();

  return useQuery({
    queryKey: ['me', userId],
    queryFn: async (): Promise<User> => {
      const response = await httpClient.get<MeResponse>('/users/me', getToken);
      return response.data;
    },
    enabled: isSignedIn && !!userId,
  });
}
