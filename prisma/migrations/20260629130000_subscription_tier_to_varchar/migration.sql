-- Convert SubscriptionTier from Postgres enum to VARCHAR. This frees us from
-- ALTER TYPE migrations every time a tier name changes; the canonical list now
-- lives in src/lib/constants/plans.ts and is enforced by a CHECK constraint.

-- 1) Cast existing enum column to text so we can drop the enum afterwards.
ALTER TABLE "subscription_plans"
  ALTER COLUMN "tier" TYPE VARCHAR(32) USING "tier"::text;

-- 2) Backfill legacy PRO rows to ENTERPRISE (data-only — no schema impact).
UPDATE "subscription_plans"
SET tier          = 'ENTERPRISE',
    monthly_price = NULL,
    yearly_price  = NULL,
    package_name  = 'Enterprise',
    description   = 'Enterprise plan — contact sales for custom pricing'
WHERE tier = 'PRO';

-- 3) Drop the now-unused enum type.
DROP TYPE "SubscriptionTier";

-- 4) Mirror the app-level allowed values at the DB layer so unknown tiers
-- can never be inserted. Update this list when SUBSCRIPTION_TIERS changes.
ALTER TABLE "subscription_plans"
  ADD CONSTRAINT "subscription_plans_tier_check"
  CHECK ("tier" IN ('FREE', 'BASE', 'ENTERPRISE'));
