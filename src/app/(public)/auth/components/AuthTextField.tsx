'use client';

import { Input } from '@/components/ui/input';
import type { LucideIcon } from 'lucide-react';

interface AuthTextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  error?: React.ReactNode;
}

export default function AuthTextField({ icon: Icon, error, ...props }: Readonly<AuthTextFieldProps>) {
  return (
    <>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input {...props} className="pl-10 h-12" />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </>
  );
}
