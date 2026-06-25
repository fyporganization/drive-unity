'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CreditCard, User, Bell, Shield, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SettingsNavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  tab?: string;
}

const settingsNavItems: SettingsNavItem[] = [
  {
    label: 'Subscription & Billing',
    icon: CreditCard,
    href: '/settings/paddlePayment',
  },
  // {
  //   label: 'Profile Settings',
  //   icon: User,
  //   href: '/settings',
  //   tab: 'profile',
  // },
  // {
  //   label: 'Notifications',
  //   icon: Bell,
  //   href: '/settings',
  //   tab: 'notifications',
  // },
  // {
  //   label: 'Privacy & Security',
  //   icon: Shield,
  //   href: '/settings',
  //   tab: 'privacy',
  // },
  // {
  //   label: 'General Settings',
  //   icon: Settings,
  //   href: '/settings',
  //   tab: 'general',
  // },
];

export const SettingsSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'general';

  return (
    <Card className="rounded-xl border-border/50 shadow-soft">
      <CardContent className="p-2">
        {settingsNavItems.map((item) => {
          const isActive =
            item.href === '/settings/paddlePayment'
              ? pathname === '/settings/paddlePayment'
              : pathname === '/settings' && currentTab === (item.tab || 'general');

          return (
            <button
              key={item.label}
              onClick={() =>
                router.push(
                  item.tab ? `${item.href}?tab=${item.tab}` : item.href
                )
              }
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
};
