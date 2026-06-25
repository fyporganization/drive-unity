'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signInAction, type SignInInput } from '../action/sign-in.action';
import { verifyOtpAction, resendOtpAction } from '../../action/verify-otp.action';

export type SignInStep = 'form' | 'otp';

export function useSignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<SignInStep>('form');
  const [pendingEmail, setPendingEmail] = useState('');

  const redirectAfterSignIn = async () => {
    const redirect = searchParams.get('redirect');
    if (redirect?.startsWith('/')) {
      router.push(redirect);
      return;
    }

    try {
      const response = await fetch('/api/googleDrive/auth/status', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        router.push(
          data.connected && data.accountsCount > 0 ? '/dashboard' : '/connections'
        );
        return;
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
    router.push('/connections');
  };

  const signIn = async (values: SignInInput) => {
    setLoading(true);

    try {
      const result = await signInAction(values);

      if (!result.success) {
        toast({
          title: 'Sign in failed',
          description: result.message || 'Please check your credentials.',
          variant: 'destructive',
        });
        return;
      }

      if (result.requiresVerification) {
        setPendingEmail(values.email);
        setStep('otp');
        toast({
          title: 'Verify your email',
          description: result.message,
        });
        return;
      }

      toast({
        title: 'Welcome back!',
        description: 'Signed in successfully',
      });

      await redirectAfterSignIn();
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code: string): Promise<boolean> => {
    setVerifying(true);

    try {
      const result = await verifyOtpAction({ code });

      if (!result.success) {
        toast({
          title: 'Error',
          description: result.message || 'Invalid verification code',
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Welcome back!',
        description: 'Signed in successfully',
      });

      await redirectAfterSignIn();
      return true;
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    const result = await resendOtpAction({ email: pendingEmail });
    toast({
      title: result.success ? 'Code sent!' : 'Error',
      description: result.message,
      variant: result.success ? undefined : 'destructive',
    });
  };

  const backToForm = () => setStep('form');

  return {
    signIn,
    verifyOtp,
    resendOtp,
    backToForm,
    step,
    pendingEmail,
    loading,
    verifying,
  };
}
