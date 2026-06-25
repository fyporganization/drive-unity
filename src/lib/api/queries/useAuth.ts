import { useQuery } from '@tanstack/react-query';

export function useAuthStatus() {
  return useQuery({
    queryKey: ['auth', 'status'],
    queryFn: async () => {
      const response = await fetch('/api/googleDrive/auth/status', {
        credentials: 'include',
      });
      if (!response.ok) return { connected: false, user: null };
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}