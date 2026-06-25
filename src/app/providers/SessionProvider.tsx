'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { logoutAction } from '@/app/(public)/auth/action/logout.action';

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: Date | string;
  role?: string;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/googleDrive/auth/status', {
        credentials: 'include',
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session refresh failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const result = await logoutAction();

      if (result.success) {
        setUser(null);
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value: SessionContextType = {
    user,
    loading,
    authenticated: !!user,
    refresh,
    logout,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  
  if (context === undefined) {
    throw new Error('useSession must be used within SessionProvider');
  }
  
  return context;
}

export function useRequireAuth(redirectTo?: string): SessionContextType {
  const session = useSession();
  
  useEffect(() => {
    if (!session.loading && !session.authenticated) {
      const currentPath = window.location.pathname;
      const redirect = redirectTo || currentPath;
      window.location.href = `/auth?redirect=${encodeURIComponent(redirect)}`;
    }
  }, [session.loading, session.authenticated, redirectTo]);
  
  return session;
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function WithAuthComponent(props: P) {
    const { user, loading } = useRequireAuth();
    
    if (loading) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          Loading...
        </div>
      );
    }
    
    if (!user) {
      return null; // Will redirect
    }
    
    return <Component {...props} />;
  };
}