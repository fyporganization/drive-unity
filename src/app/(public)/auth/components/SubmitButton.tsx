'use client';

import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  loading: boolean;
  children: React.ReactNode;
}

export default function SubmitButton({ loading, children }: Readonly<SubmitButtonProps>) {
  return (
    <Button variant="hero" size="lg" className="w-full" type="submit" disabled={loading}>
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </Button>
  );
}
