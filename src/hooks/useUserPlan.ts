'use client';

import { useQuery } from '@tanstack/react-query';
import type { SubscriptionTier } from '@/lib/constants/plans';

export type { SubscriptionTier };

export interface UserPlan {
  tier: SubscriptionTier;
  packageName: string;
  isPaid: boolean;
}

async function fetchUserPlan(): Promise<UserPlan | null> {
  const res = await fetch('/api/me/plan', { credentials: 'include', cache: 'no-store' });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error(`Failed to fetch plan: ${res.status}`);
  return res.json();
}

export function useUserPlan() {
  return useQuery({
    queryKey: ['user-plan'],
    queryFn: fetchUserPlan,
    staleTime: 60_000,
  });
}
