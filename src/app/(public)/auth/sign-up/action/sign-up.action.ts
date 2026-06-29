'use server';

import { db } from '@/lib/db';
import { signupSchema, validateData } from '@/lib/validations/schemas';
import { encrypt } from '@/lib/encryption';
import { isPasswordStrong } from '@/lib/auth/password-strength';
import { createSession } from '@/lib/auth/session-create';
import { createOTPCode } from '@/lib/auth/otp';
import { sendOTPEmail } from '@/lib/auth/email';
import { checkAuthRateLimit } from '@/lib/auth/action-helpers';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface SignUpResult {
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

export async function signUpAction(input: SignUpInput): Promise<SignUpResult> {
  try {
    const rateLimited = await checkAuthRateLimit('sign-up', 5);
    if (rateLimited) return rateLimited;

    const validation = validateData(signupSchema, input);

    if (!validation.success) {
      return {
        success: false,
        message: 'Please check the form for errors.',
        errors: validation.errors,
      };
    }

    const { name, email, password } = validation.data;

    if (!isPasswordStrong(password)) {
      return {
        success: false,
        message:
          'Password is not strong enough. Must contain uppercase, lowercase, number, and special character.',
      };
    }

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email already exists',
      };
    }

    const bypassOTP =
      process.env.NODE_ENV === 'development' ||
      process.env.BYPASS_OTP === 'true';

    const encryptedPassword = encrypt(password);

    const user = await db.user.create({
      data: {
        email,
        name: name.trim(),
        password: encryptedPassword,
        role: 'USER',
        emailVerified: bypassOTP ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (bypassOTP) {
      await createSession(user.id);

      return {
        success: true,
        requiresVerification: false,
        message: 'Account created successfully',
        user,
      };
    }

    const code = await createOTPCode(user.id);
    await sendOTPEmail(user.email, user.name, code);

    return {
      success: true,
      requiresVerification: true,
      message: `We sent a verification code to ${user.email}`,
      user,
    };
  } catch (error: any) {
    console.error('Sign up error:', error);

    if (error.code === 'P2002') {
      return {
        success: false,
        message: 'An account with this email already exists',
      };
    }

    return {
      success: false,
      message: 'Failed to create account. Please try again.',
    };
  }
}
