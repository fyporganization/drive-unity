'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signUpAction, type SignUpInput } from '../action/sign-up.action';
import { verifyOtpAction, resendOtpAction } from '../../action/verify-otp.action';

export type SignUpStep = 'form' | 'otp';

export function useSignUp() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [step, setStep] = useState<SignUpStep>('form');
  const [pendingEmail, setPendingEmail] = useState('');

  const signUp = async (values: SignUpInput) => {
    setLoading(true);

    try {
      const result = await signUpAction(values);

      if (!result.success) {
        toast({
          title: 'Sign up failed',
          description: result.message || 'Please check the form and try again.',
          variant: 'destructive',
        });
        return;
      }

      if (result.requiresVerification) {
        setPendingEmail(values.email);
        setStep('otp');
        toast({
          title: 'Code sent!',
          description: result.message,
        });
        return;
      }

      toast({
        title: 'Welcome!',
        description: "Let's connect your first drive",
      });

      router.push('/connections');
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
        title: 'Welcome!',
        description: "Let's connect your first drive",
      });

      router.push('/connections');
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
    signUp,
    verifyOtp,
    resendOtp,
    backToForm,
    step,
    pendingEmail,
    loading,
    verifying,
  };
}
