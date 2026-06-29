'use client';

import { useEffect, useRef } from 'react';
import { useUserPlan } from '@/hooks/useUserPlan';

interface AdSlotProps {
  slotId: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';
  layout?: string;
  className?: string;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slotId,
  format = 'auto',
  layout,
  className,
  responsive = true,
}: AdSlotProps) {
  const { data: plan, isLoading } = useUserPlan();
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    if (!plan || plan.tier !== 'FREE') return;
    if (!clientId) return;
    if (!insRef.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (err) {
      console.warn('AdSense push failed:', err);
    }
  }, [plan, clientId]);

  if (isLoading) return null;
  if (!clientId) return null;
  if (!plan || plan.tier !== 'FREE') return null;

  return (
    <ins
      ref={insRef}
      className={`adsbygoogle ${className ?? ''}`.trim()}
      style={{ display: 'block' }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format={format}
      data-ad-layout={layout}
      data-full-width-responsive={responsive ? 'true' : 'false'}
    />
  );
}
