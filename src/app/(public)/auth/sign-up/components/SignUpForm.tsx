'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Mail, User, Check, X } from 'lucide-react';
import { checkPasswordStrength } from '@/lib/auth/password-strength';
import { isValidEmail } from '@/lib/validations/email';
import AuthHeader from '../../components/AuthHeader';
import AuthTextField from '../../components/AuthTextField';
import PasswordField from '../../components/PasswordField';
import SubmitButton from '../../components/SubmitButton';
import OtpVerification from '../../components/OtpVerification';
import { useSignUp } from '../hooks/useSignUp';

const strengthColors = {
  weak: 'bg-destructive',
  fair: 'bg-orange-500',
  good: 'bg-yellow-500',
  strong: 'bg-green-500',
} as const;

const strengthWidths = {
  weak: 'w-1/4',
  fair: 'w-2/4',
  good: 'w-3/4',
  strong: 'w-full',
} as const;

interface SignUpValues {
  name: string;
  email: string;
  password: string;
}

export default function SignUpForm() {
  const {
    signUp,
    verifyOtp,
    resendOtp,
    backToForm,
    step,
    pendingEmail,
    loading,
    verifying,
  } = useSignUp();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onSubmit',
  });

  const password = watch('password') ?? '';
  const strength = checkPasswordStrength(password);

  const onSubmit = handleSubmit(async (values) => {
    await signUp({ ...values, name: values.name.trim() });
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
        icon={User}
        title="Create your account"
        subtitle="Start unifying your drives today"
      />

      <form onSubmit={onSubmit} className="space-y-4">
        <AuthTextField
          icon={User}
          placeholder="Your name"
          autoComplete="name"
          disabled={loading}
          required
          error={errors.name?.message}
          {...register('name', {
            validate: (value) =>
              value.trim().length >= 2 || 'Name must be at least 2 characters',
          })}
        />

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
          placeholder="Create a password"
          autoComplete="new-password"
          disabled={loading}
          required
          error={errors.password?.message}
          {...register('password', {
            validate: (value) =>
              checkPasswordStrength(value).score >= 4 ||
              'Password is not strong enough',
          })}
        />

        {/* Password strength */}
        {password.length > 0 && (
          <div className="space-y-2">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${strengthColors[strength.strength]} ${strengthWidths[strength.strength]}`}
              />
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              Strength: {strength.strength}
            </p>
            {strength.requirements.length > 0 && (
              <ul className="space-y-1">
                {strength.requirements.map((req) => (
                  <li key={req} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <X className="w-3 h-3 text-destructive" /> {req}
                  </li>
                ))}
              </ul>
            )}
            {strength.requirements.length === 0 && (
              <p className="flex items-center gap-1.5 text-xs text-green-600">
                <Check className="w-3 h-3" /> All requirements met
              </p>
            )}
          </div>
        )}

        <SubmitButton loading={loading}>Create Account</SubmitButton>
      </form>

      <p className="text-xs text-muted-foreground text-center mt-6 leading-relaxed">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
        <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
      </p>

      <p className="text-sm text-muted-foreground text-center mt-4">
        Already have an account?{' '}
        <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
