import { db } from '@/lib/db';
import crypto from 'crypto';

function hashOTP(code: string): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  return crypto.createHmac('sha256', Buffer.from(key, 'hex')).update(code).digest('hex');
}

export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOTPCode(userId: string): Promise<string> {
  const code = generateOTPCode();
  const hashedCode = hashOTP(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.oTPCode.deleteMany({
    where: {
      userId,
      used: false,
    },
  });

  await db.oTPCode.create({
    data: {
      code: hashedCode,
      userId,
      expiresAt,
      used: false,
      attempts: 0,
    },
  });

  return code;
}

export async function verifyOTPCode(code: string) {
  const hashedCode = hashOTP(code);
  const otpRecord = await db.oTPCode.findUnique({
    where: { code: hashedCode },
    include: { user: true },
  });

  if (!otpRecord) {
    return { success: false, error: 'Invalid verification code', user: null };
  }

  if (otpRecord.used) {
    return { success: false, error: 'Code already used', user: null };
  }

  if (new Date() > otpRecord.expiresAt) {
    return { success: false, error: 'Code expired. Please request a new one.', user: null };
  }

  if (otpRecord.attempts >= 5) {
    return {
      success: false,
      error: 'Too many attempts. Please request a new code.',
      user: null
    };
  }

  await db.oTPCode.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  return { success: true, user: otpRecord.user, error: null };
}

export async function incrementOTPAttempts(code: string) {
  const hashedCode = hashOTP(code);
  const otpRecord = await db.oTPCode.findUnique({
    where: { code: hashedCode },
  });

  if (otpRecord && !otpRecord.used) {
    await db.oTPCode.update({
      where: { id: otpRecord.id },
      data: { attempts: otpRecord.attempts + 1 },
    });
  }
}

export async function cleanupExpiredOTPCodes() {
  const result = await db.oTPCode.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true },
        { attempts: { gte: 5 } },
      ],
    },
  });

  console.log('Cleaned up', result.count, 'OTP codes');
  return result.count;
}