'use client';

import { theme } from '@/styles/mantine-theme';
import { MantineProvider as BaseMantineProvider, ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

export function MantineProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseMantineProvider theme={theme}>
      <Notifications />
      {children}
    </BaseMantineProvider>
  );
}