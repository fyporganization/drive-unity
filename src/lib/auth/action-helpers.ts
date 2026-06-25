import { headers } from 'next/headers';
import { authRateLimit } from '@/lib/middleware/rate-limit';

export interface ActionError {
  success: false;
  message: string;
}

export async function getRequestIdentifier(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return headerList.get('x-real-ip') || 'anonymous';
}

export async function checkAuthRateLimit(
  key: string,
  limit: number
): Promise<ActionError | null> {
  const identifier = await getRequestIdentifier();
  const rateCheck = authRateLimit.check(`${key}:${identifier}`, limit);

  if (!rateCheck.success) {
    return {
      success: false,
      message: `Too many attempts. Please try again in ${rateCheck.retryAfter} seconds.`,
    };
  }

  return null;
}
