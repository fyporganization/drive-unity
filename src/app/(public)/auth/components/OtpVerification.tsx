'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, ShieldCheck, Loader2, Info } from 'lucide-react';
import AuthHeader from './AuthHeader';

const OTP_SLOT_IDS = ['otp-1', 'otp-2', 'otp-3', 'otp-4', 'otp-5', 'otp-6'];

interface OtpVerificationProps {
  email: string;
  verifying: boolean;
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export default function OtpVerification({
  email,
  verifying,
  onVerify,
  onResend,
  onBack,
}: Readonly<OtpVerificationProps>) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    otpRefs.current[0]?.focus();
  }, []);

  const submitCode = async (code: string) => {
    const ok = await onVerify(code);
    if (!ok) {
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    }
  };

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (value.length > 1) value = value.at(-1) ?? '';
      if (value && !/^\d$/.test(value)) return;
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }

      // Auto-submit
      if (value && index === 5 && newOtp.every((d) => d !== '')) {
        submitCode(newOtp.join(''));
      }
    },
    [otp]
  );

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '']);
    await onResend();
    otpRefs.current[0]?.focus();
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        disabled={verifying}
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <AuthHeader
        icon={ShieldCheck}
        title="Enter Verification Code"
        subtitle={
          <>
            We sent a code to <span className="font-semibold text-foreground">{email}</span>
          </>
        }
      />

      {/* OTP inputs */}
      <div className="flex gap-3 justify-center mb-6">
        {OTP_SLOT_IDS.map((slotId, i) => (
          <input
            key={slotId}
            ref={(el) => { otpRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[i]}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(i, e)}
            disabled={verifying}
            className="w-12 h-14 rounded-xl border border-border bg-card text-center text-xl font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition-all disabled:opacity-50"
          />
        ))}
      </div>

      {verifying && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
          <Loader2 className="w-4 h-4 animate-spin" />
          Verifying...
        </div>
      )}

      {/* Info */}
      <div className="p-3 rounded-lg bg-accent/50 border border-primary/10 flex items-start gap-2 mb-6">
        <Info className="w-4 h-4 text-accent-foreground mt-0.5 shrink-0" />
        <div className="text-xs text-accent-foreground">
          <p>Code expires in 10 minutes</p>
          <p>Maximum 5 attempts allowed</p>
        </div>
      </div>

      <button
        onClick={handleResend}
        disabled={verifying}
        className="w-full text-center text-sm text-primary hover:underline disabled:opacity-50"
      >
        Didn&apos;t receive a code? Resend
      </button>
    </div>
  );
}
