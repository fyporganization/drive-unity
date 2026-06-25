'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { useAuthStatus } from '@/app/(private)/hooks/useAuthStatus';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Camera,
  Mail,
  Phone,
  MapPin,
  Globe,
  MessageSquare,
  FileText,
  Zap,
  Lock,
  Eye,
  Smartphone,
  Download,
  Trash2,
  Monitor,
  Palette,
  Languages,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SettingsSidebar } from '@/app/(private)/settings/_components/sidebar';

/* ──────────── Profile Settings ──────────── */
function ProfileSettings() {
  const { data, isLoading } = useAuthStatus();
  const user = data?.user;

  const name = user?.name || '';
  const email = user?.email || '';
  const role = user?.role || 'USER';
  const emailVerified = !!user?.emailVerified;

  // Generate initials from name
  const initials = name
    ? name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : email
    ? email[0].toUpperCase()
    : '?';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">Profile Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your personal information</p>
        </div>
        <Card className="rounded-xl border-border/50 shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-muted shimmer" />
              <div className="space-y-2">
                <div className="h-4 w-32 rounded bg-muted shimmer" />
                <div className="h-3 w-48 rounded bg-muted shimmer" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-foreground">
          Profile Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information
        </p>
      </div>

      {/* Avatar */}
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-display font-bold text-2xl shadow-glow">
                {initials}
              </div>
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-background border border-border/50 flex items-center justify-center shadow-sm hover:bg-muted transition-colors">
                <Camera className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{name || 'No name set'}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="secondary" className="text-[10px]">
                  {role === 'ADMIN' ? 'Admin' : 'Free Plan'}
                </Badge>
                {emailVerified && (
                  <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200/60">
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input defaultValue={name} placeholder="Your name" className="pl-10 h-10 rounded-lg border-border/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input defaultValue={email} className="pl-10 h-10 rounded-lg border-border/50" disabled />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Not set" className="pl-10 h-10 rounded-lg border-border/50" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Not set" className="pl-10 h-10 rounded-lg border-border/50" />
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button size="sm" className="rounded-lg">Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Info */}
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Account Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/40">
              <p className="text-xs text-muted-foreground mb-0.5">Role</p>
              <p className="text-sm font-medium text-foreground">{role}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40">
              <p className="text-xs text-muted-foreground mb-0.5">Email Status</p>
              <p className="text-sm font-medium text-foreground">{emailVerified ? 'Verified' : 'Unverified'}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/40">
              <p className="text-xs text-muted-foreground mb-0.5">Connected Drives</p>
              <p className="text-sm font-medium text-foreground">{data?.accountsCount ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ──────────── Notifications ──────────── */
function NotificationSettings() {
  const notifications = [
    { icon: Mail, label: 'Email Notifications', desc: 'Receive updates via email', enabled: true },
    { icon: Bell, label: 'Push Notifications', desc: 'Browser push alerts', enabled: false },
    { icon: FileText, label: 'Weekly Digest', desc: 'Summary of your drive activity', enabled: true },
    { icon: Zap, label: 'Sync Alerts', desc: 'Notify when sync completes or fails', enabled: true },
    { icon: MessageSquare, label: 'Product Updates', desc: 'New features and improvements', enabled: false },
    { icon: Globe, label: 'Marketing Emails', desc: 'Tips, offers, and announcements', enabled: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-foreground">
          Notifications
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose what you want to be notified about
        </p>
      </div>

      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-2">
          {notifications.map((item, i) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Switch defaultChecked={item.enabled} />
              </div>
              {i < notifications.length - 1 && <Separator className="mx-4" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ──────────── Privacy & Security ──────────── */
function PrivacySettings() {
  const sessions = [
    { device: 'Chrome on Windows', location: 'San Francisco, CA', time: '2 min ago', current: true },
    { device: 'Safari on iPhone', location: 'San Francisco, CA', time: '1 hour ago', current: false },
    { device: 'Firefox on MacOS', location: 'New York, NY', time: '3 days ago', current: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-foreground">
          Privacy & Security
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your security preferences and data
        </p>
      </div>

      {/* Security Options */}
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-6 space-y-5">
          <h3 className="text-sm font-semibold text-foreground">Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg">Enable</Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Activity Log Visibility</p>
                  <p className="text-xs text-muted-foreground">Who can see your activity</p>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">Only me</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Active Sessions</h3>
            <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive/80">
              Sign out all
            </Button>
          </div>
          <div className="space-y-3">
            {sessions.map((s) => (
              <div
                key={s.device}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/40"
              >
                <div className="flex items-center gap-3">
                  <Smartphone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      {s.device}
                      {s.current && (
                        <Badge variant="secondary" className="text-[10px] bg-emerald-50 text-emerald-600 border-emerald-200/60">
                          Current
                        </Badge>
                      )}
                    </span>
                    <p className="text-xs text-muted-foreground">
                      {s.location} &middot; {s.time}
                    </p>
                  </div>
                </div>
                {!s.current && (
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                    Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Your Data</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" size="sm" className="rounded-lg gap-2">
              <Download className="w-4 h-4" />
              Export My Data
            </Button>
            <Button variant="outline" size="sm" className="rounded-lg gap-2 text-destructive border-destructive/30 hover:bg-destructive/5">
              <Trash2 className="w-4 h-4" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ──────────── General Settings ──────────── */
function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-display font-bold text-foreground">
          General Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          App preferences and configuration
        </p>
      </div>

      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-2">
          {[
            { icon: Palette, label: 'Theme', desc: 'Appearance and color scheme', value: 'System' },
            { icon: Languages, label: 'Language', desc: 'Display language', value: 'English' },
            { icon: Clock, label: 'Timezone', desc: 'Your local timezone', value: 'PST (UTC-8)' },
            { icon: Monitor, label: 'Default View', desc: 'Files page layout preference', value: 'Table' },
          ].map((item, i, arr) => (
            <div key={item.label}>
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">{item.value}</Badge>
              </div>
              {i < arr.length - 1 && <Separator className="mx-4" />}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Storage */}
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-6 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Storage & Cache</h3>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">Cache Usage</span>
                <span className="font-medium text-foreground">24 MB</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[15%] rounded-full bg-primary" />
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-lg">
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ──────────── Tab Router ──────────── */
function SettingsContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'general';

  switch (tab) {
    case 'profile':
      return <ProfileSettings />;
    case 'notifications':
      return <NotificationSettings />;
    case 'privacy':
      return <PrivacySettings />;
    case 'general':
    default:
      return <GeneralSettings />;
  }
}

/* ──────────── Main Page ──────────── */
export default function Page() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 lg:p-10 max-w-6xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-display font-bold text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and preferences
        </p>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:w-[240px] shrink-0"
        >
          <Suspense>
            <SettingsSidebar />
          </Suspense>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex-1 min-w-0"
        >
          <Suspense>
            <SettingsContent />
          </Suspense>
        </motion.div>
      </div>
    </motion.div>
  );
}
