"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Link2,
  FolderOpen,
  Search,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useConnectionStatus } from "@/app/(private)/hooks/useConnectionStatus";

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

function statusDotClass(statusLoading: boolean, isConnected: boolean): string {
  if (statusLoading) return "bg-muted-foreground animate-pulse";
  if (isConnected) return "bg-emerald-500";
  return "bg-amber-500 animate-pulse";
}

function statusTitle(statusLoading: boolean, isConnected: boolean): string {
  if (statusLoading) return "Checking...";
  return isConnected ? "Drive Connected" : "Not Connected";
}

function statusSubtitle(statusLoading: boolean, isConnected: boolean): string {
  if (statusLoading) return "Verifying status";
  return isConnected ? "Connected & synced" : "Setup required";
}

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
  href?: string;
  requiresDrive: boolean;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", requiresDrive: true },
  { icon: Link2, label: "Connections", path: "/connections", requiresDrive: false },
  { icon: FolderOpen, label: "File Management", path: "/files", requiresDrive: true },
  { icon: Search, label: "AI Search", path: "/search", requiresDrive: true },
  { icon: BarChart3, label: "Analytics", path: "/analytics", requiresDrive: true },
  { icon: Settings, label: "Settings", path: "/settings", href: "/settings?tab=profile", requiresDrive: false },
];

interface PrivateSidebarProps {
  collapsed: boolean;
}

export default function PrivateSidebar({ collapsed }: PrivateSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, statusLoading } = useConnectionStatus();

  const handleNav = (item: NavItem) => {
    if (item.requiresDrive && !isConnected) {
      router.push("/connections");
      return;
    }
    router.push(item.href ?? item.path);
  };

  const isActive = (path: string) =>
    pathname === path || (path !== "/dashboard" && pathname.startsWith(path));

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col bg-background relative">
        {!collapsed && (
          <div className="px-5 py-5 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-cta flex items-center justify-center shadow-soft shrink-0">
                <Zap className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <span className="font-display font-bold text-foreground text-sm">
                  DriveUnity
                </span>
                <span className="text-[10px] text-muted-foreground block -mt-0.5">
                  Workspace
                </span>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((item, i) => {
            const active = isActive(item.path);
            const disabled = item.requiresDrive && !isConnected && !statusLoading;

            const navButton = (
              <motion.button
                key={item.path}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.25 }}
                onClick={() => handleNav(item)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 group ${navButtonClass(active, disabled)}`}
              >
                <item.icon className={`w-4 h-4 shrink-0 ${navIconClass(active, disabled)}`} />
                {!collapsed && (
                  <span className="flex-1 text-left">{item.label}</span>
                )}
                {!collapsed && (item as any).comingSoon && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                    Soon
                  </span>
                )}
              </motion.button>
            );

            if (disabled && !collapsed) {
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>{navButton}</TooltipTrigger>
                  <TooltipContent side="right">
                    <p className="text-xs">
                      Connect Drive to access this feature
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return navButton;
          })}
        </nav>

        {!collapsed && (
          <div className="px-3 pb-4">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                isConnected
                  ? "border-emerald-200/60 bg-emerald-50/40"
                  : "border-amber-200/60 bg-amber-50/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full shrink-0 ${statusDotClass(statusLoading, isConnected)}`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {statusTitle(statusLoading, isConnected)}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {statusSubtitle(statusLoading, isConnected)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}