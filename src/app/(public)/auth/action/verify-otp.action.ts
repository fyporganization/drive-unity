'use server';

import { db } from '@/lib/db';
import { verifyOTPSchema, emailSchema, validateData } from '@/lib/validations/schemas';
import { verifyOTPCode, incrementOTPAttempts, createOTPCode } from '@/lib/auth/otp';
import { sendOTPEmail } from '@/lib/auth/email';
import { createSession } from '@/lib/auth/session';
import { checkAuthRateLimit } from '@/lib/auth/action-helpers';

export interface VerifyOtpResult {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export interface ResendOtpResult {
  success: boolean;
  message?: string;
}

export async function verifyOtpAction(input: { code: string }): Promise<VerifyOtpResult> {
  try {
    const rateLimited = await checkAuthRateLimit('verify-otp', 5);
    if (rateLimited) return rateLimited;

    const validation = validateData(verifyOTPSchema, input);

    if (!validation.success) {
      return { success: false, message: 'Code must be exactly 6 digits' };
    }

    const { code } = validation.data;
    const result = await verifyOTPCode(code);

    if (!result.success) {
      await incrementOTPAttempts(code);
      return {
        success: false,
        message: result.error || 'Invalid verification code',
      };
    }

    const user = result.user!;

    if (!user.emailVerified) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    }

    await createSession(user.id);

    return {
      success: true,
      message: 'Successfully verified',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return {
      success: false,
      message: 'Failed to verify code. Please try again.',
    };
  }
}

export async function resendOtpAction(input: { email: string }): Promise<ResendOtpResult> {
  try {
    const rateLimited = await checkAuthRateLimit('resend-otp', 5);
    if (rateLimited) return rateLimited;

    const validation = validateData(emailSchema, input.email);

    if (!validation.success) {
      return { success: false, message: 'Invalid email format' };
    }

    const user = await db.user.findUnique({
      where: { email: validation.data },
      select: { id: true, name: true, email: true },
    });

    // Generic response either way to avoid leaking which emails exist
    if (user) {
      const code = await createOTPCode(user.id);
      await sendOTPEmail(user.email, user.name, code);
    }

    return {
      success: true,
      message: 'If the account exists, a new code has been sent.',
    };
  } catch (error) {
    console.error('Resend OTP error:', error);
    return {
      success: false,
      message: 'Failed to send code. Please try again.',
    };
  }
}
