export const SUBSCRIPTION_TIERS = ['FREE', 'BASE', 'ENTERPRISE'] as const;

export type SubscriptionTier = (typeof SUBSCRIPTION_TIERS)[number];

export const DEFAULT_TIER: SubscriptionTier = 'FREE';

export function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return typeof value === 'string' && (SUBSCRIPTION_TIERS as readonly string[]).includes(value);
}

export function isPaidTier(tier: SubscriptionTier): boolean {
  return tier !== 'FREE';
}
