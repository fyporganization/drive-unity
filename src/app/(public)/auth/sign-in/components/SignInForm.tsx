'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail } from 'lucide-react';
import { isValidEmail } from '@/lib/validations/email';
import AuthHeader from '../../components/AuthHeader';
import AuthTextField from '../../components/AuthTextField';
import PasswordField from '../../components/PasswordField';
import SubmitButton from '../../components/SubmitButton';
import OtpVerification from '../../components/OtpVerification';
import { useSignIn } from '../hooks/useSignIn';

interface SignInValues {
  email: string;
  password: string;
}

export default function SignInForm() {
  const {
    signIn,
    verifyOtp,
    resendOtp,
    backToForm,
    step,
    pendingEmail,
    loading,
    verifying,
  } = useSignIn();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const onSubmit = handleSubmit(async (values) => {
    await signIn(values);
  });

  if (step === 'otp') {
    return (
      <OtpVerification
        email={pendingEmail}
        verifying={verifying}
        onVerify={verifyOtp}
        onResend={resendOtp}
        onBack={backToForm}
      />
    );
  }

  return (
    <div>
      <AuthHeader
        icon={Mail}
        title="Welcome back"
        subtitle="Sign in to your DriveUnity account"
      />

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthTextField
          icon={Mail}
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={loading}
          required
          error={errors.email?.message}
          {...register('email', {
            validate: (value) => isValidEmail(value) || 'Invalid email',
          })}
        />

        <PasswordField
          placeholder="Your password"
          autoComplete="current-password"
          disabled={loading}
          required
          error={errors.password?.message}
          {...register('password', {
            validate: (value) => value.length > 0 || 'Password is required',
          })}
        />

        <SubmitButton loading={loading}>Sign In</SubmitButton>
      </form>

      <p className="text-sm text-muted-foreground text-center mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
          Sign up
        </Link>
      </p>
    </div>
  );
}
