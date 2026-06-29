'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PanelLeft, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import PrivateSidebar from '@/app/(private)/_components/layout/PrivateSidebar';
import AdminSidebar from '@/app/(private)/_components/layout/AdminSidebar';
import PrivateTopbar from '@/app/(private)/_components/layout/PrivateTopbar';
import './private.css';

interface User {
  id: string;
  name: string;
  email: string;
}

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked && !loading && !user) {
      const authUrl = `/auth?redirect=${encodeURIComponent(pathname)}`;
      router.push(authUrl);
    }
  }, [authChecked, loading, user, pathname, router]);

  const checkAuth = async () => {
    try {
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
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center shadow-soft">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="font-display font-bold text-foreground text-sm">
              DriveUnity
            </span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1 h-1 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-1 h-1 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-1 h-1 rounded-full bg-primary/60 animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-cta flex items-center justify-center shadow-soft">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-sm text-muted-foreground">
            Redirecting to login...
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background private-layout">
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 250 : 0 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="shrink-0 h-screen sticky top-0 overflow-hidden border-r border-border/50 z-20 hidden md:block"
      >
        {pathname.startsWith('/admin') ? (
          <AdminSidebar collapsed={!sidebarOpen} />
        ) : (
          <PrivateSidebar collapsed={!sidebarOpen} />
        )}
      </motion.aside>

      <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
        <SheetContent side="left" className="w-[270px] p-0 border-r border-border/50 md:hidden">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          {pathname.startsWith('/admin') ? (
            <AdminSidebar collapsed={false} />
          ) : (
            <PrivateSidebar collapsed={false} />
          )}
        </SheetContent>
      </Sheet>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="h-14 w-11 rounded-none border-r border-border/50 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (window.innerWidth < 768) {
                  setMobileSheetOpen(true);
                } else {
                  setSidebarOpen(!sidebarOpen);
                }
              }}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
            <div className="flex-1">
              <PrivateTopbar />
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-auto">
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
