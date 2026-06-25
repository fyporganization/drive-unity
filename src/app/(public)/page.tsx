'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import HomePage from './home/content';

export default function RootPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const sessionResponse = await fetch('/api/googleDrive/auth/status', {
        credentials: 'include',
      });

      if (sessionResponse.ok) {
        const sessionData = await sessionResponse.json();
        if (sessionData.authenticated && sessionData.user) {
          if (sessionData.connected && sessionData.accountsCount > 0) {
              router.push('/dashboard');
          } else {
            router.push('/connections');
          }
          return;
        }
      }
      router.push('/home');
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/home');
    } finally {
      setChecking(false);
    }
  };

  return <HomePage/>
}