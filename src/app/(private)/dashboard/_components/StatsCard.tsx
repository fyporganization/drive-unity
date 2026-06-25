"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FileText, FolderOpen, TrendingDown } from "lucide-react";
import { findDuplicatesAction } from "@/lib/actions/drive-filters.action";

interface DashboardStats {
  success: boolean;
  fileCount: number;
  folderCount: number;
}

interface DuplicateStats {
  success: boolean;
  count: number;
  totalSavingsGB: number;
  totalSavingsBytes: number;
}

interface DriveAccount {
  id: string;
  gmailAccount?: string;
  onedriveAccount?: string;
}

// ── Fetchers ──────────────────────────────────────────────────────────────────

const fetchGoogleStats = async (): Promise<DashboardStats> => {
  const res = await fetch("/api/googleDrive/dashboard");
  if (!res.ok) return { success: false, fileCount: 0, folderCount: 0 };
  return res.json();
};

const fetchOneDriveStats = async (): Promise<DashboardStats> => {
  const res = await fetch("/api/onedrive/dashboard");
  if (!res.ok) return { success: false, fileCount: 0, folderCount: 0 };
  return res.json();
};

const fetchGoogleDuplicates = async (
  userId: string
): Promise<DuplicateStats> => {
  const result = await findDuplicatesAction("google", { userId });
  if (!result.success) return { success: false, count: 0, totalSavingsGB: 0, totalSavingsBytes: 0 };
  return result;
};

const fetchOneDriveDuplicates = async (
  userId: string
): Promise<DuplicateStats> => {
  const result = await findDuplicatesAction("onedrive", { userId });
  if (!result.success) return { success: false, count: 0, totalSavingsGB: 0, totalSavingsBytes: 0 };
  return result;
};

// ── StatCard UI ───────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle: string;
  accentFrom: string;
  accentTo: string;
  index: number;
}

const StatCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  accentFrom,
  accentTo,
  index,
}: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
    className="group relative rounded-xl bg-card border border-border/50 p-6 overflow-hidden hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5"
  >
    <div
      className="absolute top-0 left-0 right-0 h-[3px]"
      style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }}
    />
    <div className="flex items-start justify-between">
      <div className="space-y-3">
        <p className="text-xs font-medium text-muted-foreground tracking-wide">
          {label}
        </p>
        <p className="text-3xl font-display font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 opacity-80"
        style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
    </div>
  </motion.div>
);

// ── StatsPanel ────────────────────────────────────────────────────────────────

export default function StatsPanel({
  userId,
  googleAccounts = [],
  onedriveAccounts = [],
}: {
  userId?: string;
  googleAccounts?: DriveAccount[];
  onedriveAccounts?: DriveAccount[];
}) {
  // Google Drive stats
  const { data: googleStats, isLoading: isGoogleLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats", "google"],
    queryFn: fetchGoogleStats,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // OneDrive stats
  const { data: onedriveStats, isLoading: isOnedriveLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats", "onedrive"],
    queryFn: fetchOneDriveStats,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // Google duplicates — all accounts in one call
  const { data: googleDuplicates } = useQuery<DuplicateStats>({
    queryKey: ["duplicateStats", "google", userId],
    queryFn: () => fetchGoogleDuplicates(userId!),
    enabled: !!userId && googleAccounts.length > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  // OneDrive duplicates — all accounts in one call
  const { data: onedriveDuplicates } = useQuery<DuplicateStats>({
    queryKey: ["duplicateStats", "onedrive", userId],
    queryFn: () => fetchOneDriveDuplicates(userId!),
    enabled: !!userId && onedriveAccounts.length > 0,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const isLoading = isGoogleLoading || isOnedriveLoading;

  if (isLoading) {
    const skeletonIds = ["stat-1", "stat-2", "stat-3"];
    return (
      <>
        {skeletonIds.map((id) => (
          <div key={id} className="rounded-xl bg-card border border-border/50 p-6 space-y-4">
            <div className="h-3 w-20 rounded bg-muted shimmer" />
            <div className="h-8 w-16 rounded bg-muted shimmer" />
            <div className="h-3 w-28 rounded bg-muted shimmer" />
          </div>
        ))}
      </>
    );
  }

  // Merge counts from both providers
  const totalFiles = (googleStats?.fileCount ?? 0) + (onedriveStats?.fileCount ?? 0);
  const totalFolders = (googleStats?.folderCount ?? 0) + (onedriveStats?.folderCount ?? 0);

  const totalSavingsGB = (googleDuplicates?.totalSavingsGB ?? 0) + (onedriveDuplicates?.totalSavingsGB ?? 0);

  const stats = [
    {
      icon: FileText,
      label: "Total Files",
      value: totalFiles.toLocaleString(),
      subtitle: "Across all connected drives",
      accentFrom: "hsl(217 91% 60%)",
      accentTo: "hsl(240 80% 60%)",
    },
    {
      icon: FolderOpen,
      label: "Total Folders",
      value: totalFolders.toLocaleString(),
      subtitle: "Organized structure",
      accentFrom: "hsl(263 70% 55%)",
      accentTo: "hsl(280 75% 55%)",
    },
    {
      icon: TrendingDown,
      label: "Potential Savings",
      value: totalSavingsGB > 0 ? `${totalSavingsGB.toFixed(2)} GB` : "0 GB",
      subtitle: "From duplicate files",
      accentFrom: "hsl(160 84% 39%)",
      accentTo: "hsl(145 63% 42%)",
    },
  ];

  return (
    <>
      {stats.map((stat, i) => (
        <StatCard key={stat.label} {...stat} index={i} />
      ))}
    </>
  );
}