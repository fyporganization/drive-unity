'use client';

import { SessionProvider } from './SessionProvider';
import { QueryProvider } from './QueryProvider';
import { MantineProvider } from './MantainProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        <MantineProvider>{children}</MantineProvider>
      </QueryProvider>
    </SessionProvider>
  );
}