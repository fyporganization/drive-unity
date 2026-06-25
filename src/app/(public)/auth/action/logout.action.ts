'use server';

import { destroySession } from '@/lib/auth/session';

export interface LogoutResult {
  success: boolean;
  message?: string;
}

export async function logoutAction(): Promise<LogoutResult> {
  try {
    await destroySession();

    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, message: 'Logout failed' };
  }
}
