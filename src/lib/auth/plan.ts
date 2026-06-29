import { db } from '@/lib/db';
import { getSession } from '@/lib/auth/session';
import {
  DEFAULT_TIER,
  isPaidTier,
  isSubscriptionTier,
  type SubscriptionTier,
} from '@/lib/constants/plans';

export interface UserPlan {
  tier: SubscriptionTier;
  packageName: string;
  isPaid: boolean;
}

export async function getUserPlan(): Promise<UserPlan | null> {
  const session = await getSession();
  if (!session?.id) return null;

  const subscription = await db.subscribedUser.findUnique({
    where: { userId: session.id },
    include: { subscriptionPlan: true },
  });

  if (!subscription) {
    return { tier: DEFAULT_TIER, packageName: 'Free', isPaid: false };
  }

  const raw = subscription.subscriptionPlan.tier;
  const tier: SubscriptionTier = isSubscriptionTier(raw) ? raw : DEFAULT_TIER;
  return {
    tier,
    packageName: subscription.subscriptionPlan.packageName,
    isPaid: isPaidTier(tier),
  };
}
