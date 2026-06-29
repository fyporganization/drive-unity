'use client';

import Script from 'next/script';
import { useUserPlan } from '@/hooks/useUserPlan';

export function AdSenseScript() {
  const { data: plan, isLoading } = useUserPlan();
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  if (isLoading) return null;
  if (!clientId) return null;
  if (!plan || plan.tier !== 'FREE') return null;

  return (
    <Script
      id="adsense-loader"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
    />
  );
}
