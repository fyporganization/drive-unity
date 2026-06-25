import { LRUCache } from 'lru-cache';

export interface RateLimitOptions {
  interval?: number;
  uniqueTokenPerInterval?: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export function createRateLimit(options: RateLimitOptions = {}) {
  const interval = options.interval || 60000;
  const uniqueTokenPerInterval = options.uniqueTokenPerInterval || 500;

  const tokenCache = new LRUCache<string, number[]>({
    max: uniqueTokenPerInterval,
    ttl: interval,
  });

  return {
    check: (identifier: string, limit: number): RateLimitResult => {
      const now = Date.now();
      const tokenCount = tokenCache.get(identifier) || [0, now];

      if (tokenCount[1] + interval <= now) {
        tokenCache.set(identifier, [1, now]);
        return {
          success: true,
          limit,
          remaining: limit - 1,
          reset: now + interval,
        };
      }

      tokenCount[0] += 1;
      tokenCache.set(identifier, tokenCount);

      const currentUsage = tokenCount[0];
      const isRateLimited = currentUsage > limit;
      const resetTime = tokenCount[1] + interval;

      return {
        success: !isRateLimited,
        limit,
        remaining: Math.max(0, limit - currentUsage),
        reset: resetTime,
        retryAfter: isRateLimited
          ? Math.ceil((resetTime - now) / 1000)
          : undefined,
      };
    },
    reset: (identifier: string): void => {
      tokenCache.delete(identifier);
    },

    getUsage: (identifier: string): { count: number; reset: number } | null => {
      const tokenCount = tokenCache.get(identifier);
      if (!tokenCount) return null;

      return {
        count: tokenCount[0],
        reset: tokenCount[1] + interval,
      };
    },
  };
}

export const authRateLimit = createRateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 1000,
});
export const apiRateLimit = createRateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 2000,
});

export const readRateLimit = createRateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 5000,
});

export const expensiveRateLimit = createRateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

export function getRequestIdentifier(
  request: Request,
  userId?: string
): string {
  if (userId) {
    return `user:${userId}`;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return `ip:${forwardedFor.split(',')[0].trim()}`;
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return `ip:${realIp}`;
  }

  return 'anonymous';
}

export function withRateLimit(
  limiter: ReturnType<typeof createRateLimit>,
  limit: number
) {
  return (identifier: string) => {
    const result = limiter.check(identifier, limit);

    const headers = new Headers({
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.reset).toISOString(),
    });

    if (!result.success && result.retryAfter) {
      headers.set('Retry-After', result.retryAfter.toString());
    }

    return {
      result,
      headers,
    };
  };
}
