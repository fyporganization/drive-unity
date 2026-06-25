export interface GoogleDriveAccount {
  id: string;
  gmailAccount: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  role: string;
}

export interface AuthStatus {
  authenticated: boolean;
  user: AuthUser | null;
  connected: boolean;
  accountsCount: number;
  accounts: GoogleDriveAccount[];
}