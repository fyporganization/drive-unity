'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useConnectOneDriveAdvanced() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [canConnect, setCanConnect] = useState(true);
  const [connectionLimit, setConnectionLimit] = useState<number | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<string>('FREE');
  const { toast } = useToast();

  const checkConnectionStatus = async () => {
    setIsCheckingStatus(true);

    try {
      const response = await fetch('/api/onedrive/connect', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();

        const limit = data.subscription.maxConnectedDrives;
        const tier = data.subscription.tier;
        const packageName = data.subscription.packageName;

        setConnectionLimit(limit);
        setSubscriptionTier(tier);
        setCanConnect(data.subscription.canAddMore);

        if (!data.subscription.canAddMore) {
          toast({
            title: 'Connection Limit Reached',
            description: `Your ${packageName} plan allows up to ${limit} OneDrive ${limit === 1 ? 'account' : 'accounts'}. Upgrade to connect more drives.`,
          });
        }
      }
    } catch (error) {
      console.error('Failed to check connection status:', error);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const connect = async () => {
    await checkConnectionStatus();

    if (!canConnect) {
      toast({
        title: 'Cannot Connect',
        description:
          'You have reached the maximum number of connected drives for your subscription plan. Please upgrade to add more drives.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Mantine's loading-toast pattern is dropped — the browser navigates
      // immediately to the OAuth flow, so a transient toast adds little value.
      window.location.href = '/api/onedrive/auth';
    } catch (error) {
      setIsConnecting(false);
      toast({
        title: 'Connection Failed',
        description: 'Unable to start the connection process',
        variant: 'destructive',
      });
    }
  };

  return {
    connect,
    isConnecting,
    canConnect,
    connectionLimit,
    subscriptionTier,
    checkConnectionStatus,
    isCheckingStatus,
  };
}
