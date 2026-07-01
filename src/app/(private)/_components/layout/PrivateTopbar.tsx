"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  Settings,
  User,
  Link2,
  Zap,
  Menu,
  Shield,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/app/providers/SessionProvider";
import { useConnectionStatus } from "@/app/(private)/hooks/useConnectionStatus";

export default function PrivateTopbar() {
  const { user, loading, logout } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isConnected, statusLoading } = useConnectionStatus([searchParams]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() ?? "?";

  const isAdmin = user?.role === "ADMIN";

  const menuItems = [
    {
      icon: User,
      label: "Profile",
      desc: "Manage your account",
      to: "/settings?tab=profile",
    },
    {
      icon: Settings,
      label: "Settings",
      desc: "App preferences",
      to: "/settings?tab=general",
    },
    {
      icon: Link2,
      label: "Connections",
      desc: isConnected ? "Drive connected" : "Setup required",
      to: "/connections",
      badge: isConnected,
    },
    ...(isAdmin
      ? [
          {
            icon: Shield,
            label: "Admin Dashboard",
            desc: "Ops + metrics + retries",
            to: "/admin",
            adminOnly: true as const,
          },
        ]
      : []),
  ];

  return (
    <header className="h-14 bg-background/80 backdrop-blur-sm border-b border-border/50 flex items-center px-4 md:px-6 z-30 relative">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 mr-auto">
        <div className="w-7 h-7 rounded-lg bg-gradient-cta flex items-center justify-center shadow-soft">
          <Zap className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
        <div className="hidden sm:block">
          <span className="font-display font-semibold text-foreground text-sm">
            DriveUnity
          </span>
        </div>
      </Link>

      {/* Desktop right */}
      <div className="hidden md:flex items-center gap-3">
        <ThemeToggle />

        {/* Connection Status */}
        {!statusLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
              isConnected
                ? "border-emerald-200/60 bg-emerald-50/50 text-emerald-700"
                : "border-amber-200/60 bg-amber-50/50 text-amber-700"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-amber-500 animate-pulse"
              }`}
            />
            {isConnected ? "Connected" : "Not Connected"}
          </motion.div>
        )}

        {/* User dropdown */}
        {loading || !user ? (
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
            <div className="w-20 h-4 rounded bg-muted animate-pulse" />
          </div>
        ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/60 transition-colors duration-150">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {user.name}
              </span>
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-60 p-1.5 border border-border/60 shadow-elevated rounded-lg"
          >
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-medium text-foreground">
                {user?.name}
              </p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            {menuItems.map((item) => {
              const adminOnly = "adminOnly" in item && item.adminOnly;
              return (
                <DropdownMenuItem
                  key={item.label}
                  onClick={() => router.push(item.to)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer"
                >
                  <item.icon
                    className={`w-4 h-4 ${adminOnly ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm block">{item.label}</span>
                  </div>
                  {adminOnly ? (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                      Admin
                    </span>
                  ) : "badge" in item && item.badge !== undefined ? (
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        item.badge
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.badge ? "Active" : "Setup"}
                    </span>
                  ) : null}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer text-destructive"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        )}
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-72 p-0 border-l border-border/50"
          >
            <SheetTitle className="sr-only">User Menu</SheetTitle>
            <div className="p-5 border-b border-border/50">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-foreground text-sm truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <ThemeToggle />
              </div>
            </div>
            <div className="p-3 space-y-1">
              {menuItems.map((item) => {
                const adminOnly = "adminOnly" in item && item.adminOnly;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      router.push(item.to);
                      setMobileOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <item.icon
                      className={`w-4 h-4 ${adminOnly ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span className="text-sm font-medium flex-1 text-left">
                      {item.label}
                    </span>
                    {adminOnly ? (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        Admin
                      </span>
                    ) : null}
                  </button>
                );
              })}
              <div className="pt-2 border-t border-border/50 mt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/5 transition-colors text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Log out</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}