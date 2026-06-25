"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthStatus } from "@/app/(private)/types/authTypes";

export function useAuthStatus() {
  return useQuery<AuthStatus>({
    queryKey: ["auth-status"],
    queryFn: async () => {
      const response = await fetch("/api/googleDrive/auth/status", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            authenticated: false,
            user: null,
            connected: false,
            accountsCount: 0,
            accounts: [],
          };
        }
        throw new Error("Failed to fetch auth status");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export function useUserId() {
  const { data, isLoading, error } = useAuthStatus();
  
  return {
    userId: data?.user?.id ?? null,
    email:data?.user?.email ?? null,
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    error,
  };
}

export function useGoogleDriveStatus() {
  const { data, isLoading, error } = useAuthStatus();
  
  return {
    connected: data?.connected ?? false,
    accountsCount: data?.accountsCount ?? 0,
    accounts: data?.accounts ?? [],
    isLoading,
    error,
  };
}

export function useOneDriveStatus() {
  const { data, isLoading, error } = useQuery<AuthStatus>({
    queryKey: ["onedrive-auth-status"],
    queryFn: async () => {
      const response = await fetch("/api/onedrive/auth/status", {
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            authenticated: false,
            user: null,
            connected: false,
            accountsCount: 0,
            accounts: [],
          };
        }
        throw new Error("Failed to fetch OneDrive auth status");
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  return {
    connected: data?.connected ?? false,
    accountsCount: data?.accountsCount ?? 0,
    accounts: data?.accounts ?? [],
    isLoading,
    error,
  };
}