import { useClerk } from '@clerk/nextjs';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores';

export const useLogout = () => {
  const { signOut } = useClerk();
  const queryClient = useQueryClient();
  const { setLoggingOut } = useAuthStore();

  const logout = async (redirectUrl = '/sign-in') => {
    setLoggingOut(true);

    try {
      // Clear all React Query cache BEFORE signOut
      queryClient.clear();

      // Remove all queries to prevent refetching
      queryClient.removeQueries();

      // Sign out from Clerk (this will redirect)
      await signOut({ redirectUrl });
    } finally {
      setLoggingOut(false);
    }
  };

  return { logout };
};
