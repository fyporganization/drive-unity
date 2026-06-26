'use server';

import { db } from '@/lib/db';
import { loginSchema, validateData } from '@/lib/validations/schemas';
import { decrypt } from '@/lib/encryption';
import { createSession } from '@/lib/auth/session';
import { createOTPCode } from '@/lib/auth/otp';
import { sendOTPEmail } from '@/lib/auth/email';
import { checkAuthRateLimit } from '@/lib/auth/action-helpers';

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignInResult {
  success: boolean;
  requiresVerification?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
  user?: {
    id: string;
    name: string | null;
    email: string;
  };
}

export async function signInAction(input: SignInInput): Promise<SignInResult> {
  try {
    const rateLimited = await checkAuthRateLimit('sign-in', 10);
    if (rateLimited) return rateLimited;

    const validation = validateData(loginSchema, input);

    if (!validation.success) {
      return {
        success: false,
        message: 'Please check your email and password.',
        errors: validation.errors,
      };
    }

    const { email, password } = validation.data;

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return { success: false, message: 'Invalid email or password' };
    }

    if (!user.password) {
      return {
        success: false,
        message: 'This account has no password set. Please use email verification to sign in.',
      };
    }

    let decryptedPassword: string;
    try {
      decryptedPassword = decrypt(user.password);
    } catch {
      console.error('Failed to decrypt password for user:', user.id);
      return { success: false, message: 'Invalid email or password' };
    }

    if (decryptedPassword !== password) {
      return { success: false, message: 'Invalid email or password' };
    }

    const bypassOTP =
      process.env.NODE_ENV === 'development' ||
      process.env.BYPASS_OTP === 'true';

    if (!user.emailVerified && !bypassOTP) {
      const code = await createOTPCode(user.id);
      await sendOTPEmail(user.email, user.name, code);

      return {
        success: true,
        requiresVerification: true,
        message: `We sent a verification code to ${user.email}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    }

    await createSession(user.id);

    return {
      success: true,
      requiresVerification: false,
      message: 'Signed in successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      message: 'Failed to sign in. Please try again.',
    };
  }
}
