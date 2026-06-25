'use client';

import { OTPInput, SlotProps } from 'input-otp';
import { cn } from '@/lib/utils';

interface OTPInputComponentProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
}

export function OTPInputComponent({
  value,
  onChange,
  onComplete,
  disabled = false,
}: OTPInputComponentProps) {
  return (
    <OTPInput
      maxLength={6}
      value={value}
      onChange={(newValue) => {
        onChange(newValue);
        if (newValue.length === 6 && onComplete) {
          onComplete(newValue);
        }
      }}
      disabled={disabled}
      containerClassName="group flex items-center has-[:disabled]:opacity-30 justify-center gap-2"
      render={({ slots }) => (
        <>
          <div className="flex gap-2">
            {slots.slice(0, 3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>

          <FakeDash />

          <div className="flex gap-2">
            {slots.slice(3).map((slot, idx) => (
              <Slot key={idx} {...slot} />
            ))}
          </div>
        </>
      )}
    />
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        'relative w-14 h-16 text-[2rem]',
        'flex items-center justify-center',
        'transition-all duration-200',
        'border-2 rounded-lg',
        'bg-white',
        'font-bold',
        'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200',
        {
          'border-blue-500 ring-2 ring-blue-200': props.isActive,
          'border-gray-300': !props.isActive,
        }
      )}
    >
      {props.char !== null && (
        <div className="text-gray-900">{props.char}</div>
      )}
      {props.hasFakeCaret && <FakeCaret />}
    </div>
  );
}

function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div className="w-px h-8 bg-blue-500" />
    </div>
  );
}

function FakeDash() {
  return (
    <div className="flex w-6 justify-center items-center">
      <div className="w-3 h-1 rounded-full bg-gray-400" />
    </div>
  );
}