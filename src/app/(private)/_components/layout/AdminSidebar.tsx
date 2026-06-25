"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  Users,
  Link2,
  ArrowLeft,
} from "lucide-react";

interface AdminNavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  comingSoon?: boolean;
}

const navItems: AdminNavItem[] = [
  { icon: LayoutDashboard, label: "Admin Dashboard", path: "/admin" },
  // Reserved for upcoming sections — keep here so the position in the sidebar
  // is stable once the routes are wired up.
  { icon: Users, label: "User Dashboard", path: "/admin/users", comingSoon: true },
  { icon: Link2, label: "Connection Dashboard", path: "/admin/connections", comingSoon: true },
];

function navButtonClass(active: boolean, disabled: boolean): string {
  if (active) return "bg-primary/10 text-primary";
  if (disabled) return "text-muted-foreground/40 cursor-not-allowed";
  return "text-muted-foreground hover:text-foreground hover:bg-muted/60";
}

function navIconClass(active: boolean, disabled: boolean): string {
  if (active) return "text-primary";
  if (disabled) return "text-muted-foreground/40";
  return "text-muted-foreground group-hover:text-foreground";
}

interface AdminSidebarProps {
  collapsed: boolean;
}

export default function AdminSidebar({ collapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) =>
    pathname === path || (path !== "/admin" && pathname.startsWith(path));

  const handleNav = (item: AdminNavItem) => {
    if (item.comingSoon) return;
    router.push(item.path);
  };

  return (
    <div className="h-full flex flex-col bg-background relative">
      {!collapsed && (
        <div className="px-5 py-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground text-sm">
                Admin
              </span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5">
                Ops console
              </span>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item, i) => {
          const active = isActive(item.path);
          const disabled = !!item.comingSoon;

          return (
            <motion.button
              key={item.path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              onClick={() => handleNav(item)}
              disabled={disabled}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group ${navButtonClass(
                active,
                disabled,
              )}`}
            >
              <item.icon
                className={`w-4 h-4 shrink-0 ${navIconClass(active, disabled)}`}
              />
              {!collapsed && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {!collapsed && item.comingSoon && (
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                  Soon
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="px-3 pb-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border/60 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to App</span>
          </button>
        </div>
      )}
    </div>
  );
}
