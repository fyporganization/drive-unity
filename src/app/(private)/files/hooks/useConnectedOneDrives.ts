import { useQuery } from '@tanstack/react-query';

interface OneDrive {
  id: string;
  email?: string;
  accountEmail?: string;
  displayName?: string;
}

interface ConnectedOneDrivesResponse {
  drives: OneDrive[];
}

/**
 * Fetches the list of OneDrive accounts connected by the user.
 * Mirrors the shape of useConnectedDrives but targets the /api/onedrive routes.
 */
export const useConnectedOneDrives = () => {
  return useQuery({
    queryKey: ['connectedOneDrives'],
    queryFn: async (): Promise<ConnectedOneDrivesResponse> => {
      const response = await fetch('/api/onedrive/connectedDrives');

      if (!response.ok) {
        // Treat a failed request as "no accounts" rather than a hard error
        // so the UI can gracefully disable the OneDrive toggle.
        return { drives: [] };
      }

      const data = await response.json();

      // Normalise: support both { drives: [] } and { data: [] } shapes
      const drives: OneDrive[] = data.drives ?? data.data ?? [];
      return { drives };
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};
