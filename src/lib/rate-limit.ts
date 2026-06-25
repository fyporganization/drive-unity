import { db } from '@/lib/db';

/**
 * Postgres-backed sliding-window rate limiter. Keyed by (user, action) — each
 * action gets its own bucket. Per-minute resolution: one row per minute per
 * user per action. The `cleanupWorkflow` (Phase 6.1) purges rows older than
 * an hour, so the table stays small.
 *
 * For the call sites, use the predefined `RATE_LIMITS` and `withRateLimit`.
 */

export const RATE_LIMITS = {
  search: { perMinute: 30, perHour: 600 },
  sync: { perMinute: 5, perHour: 10 },
  chat: { perMinute: 20, perHour: 60 },
  backfill: { perMinute: 2, perHour: 5 },
} as const;

export type RateLimitAction = keyof typeof RATE_LIMITS;

export interface RateLimitResult {
  allowed: boolean;
  remaining_minute: number;
  remaining_hour: number;
  reset_at: Date;
}

/**
 * Increments the per-minute counter for (userId, action) and checks both the
 * per-minute and per-hour quotas. Atomic via Postgres unique upsert.
 */
export async function checkRateLimit(
  userId: string,
  action: RateLimitAction
): Promise<RateLimitResult> {
  const now = new Date();
  const minuteBucket = new Date(Math.floor(now.getTime() / 60_000) * 60_000);
  const oneHourAgo = new Date(now.getTime() - 60 * 60_000);
  const limits = RATE_LIMITS[action];

  const row = await db.rateLimit.upsert({
    where: { userId_action_windowAt: { userId, action, windowAt: minuteBucket } },
    create: { userId, action, windowAt: minuteBucket, count: 1 },
    update: { count: { increment: 1 } },
    select: { count: true },
  });

  const hourAggregate = await db.rateLimit.aggregate({
    where: { userId, action, windowAt: { gte: oneHourAgo } },
    _sum: { count: true },
  });
  const hourCount = hourAggregate._sum.count ?? 0;

  const minuteOver = row.count > limits.perMinute;
  const hourOver = hourCount > limits.perHour;

  return {
    allowed: !minuteOver && !hourOver,
    remaining_minute: Math.max(0, limits.perMinute - row.count),
    remaining_hour: Math.max(0, limits.perHour - hourCount),
    reset_at: new Date(minuteBucket.getTime() + 60_000),
  };
}

export class RateLimitExceededError extends Error {
  constructor(public result: RateLimitResult, public action: RateLimitAction) {
    super(`Rate limit exceeded for action "${action}"`);
    this.name = 'RateLimitExceededError';
  }
}

/**
 * Helper for Server Actions / route handlers: checks the limit and throws
 * RateLimitExceededError if blocked. Otherwise returns the result for headers.
 *
 *   const limit = await enforceRateLimit(session.id, 'search');
 *   // proceed with action
 */
export async function enforceRateLimit(
  userId: string,
  action: RateLimitAction
): Promise<RateLimitResult> {
  const result = await checkRateLimit(userId, action);
  if (!result.allowed) {
    throw new RateLimitExceededError(result, action);
  }
  return result;
}
