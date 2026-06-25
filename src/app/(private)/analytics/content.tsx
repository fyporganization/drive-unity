'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  FileText,
  HardDrive,
  TrendingDown,
  Image,
  Video,
  Music,
  Archive,
  Code2,
  Table2,
  Presentation,
  HelpCircle,
  Loader2,
  ExternalLink,
  Clock,
  Eye,
  AlertTriangle,
  Copy,
  Layers,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUserId } from '@/app/(private)/hooks/useAuthStatus';
import { useConnectedDrives } from '@/app/(private)/connections/hooks/useConnectedDrives';
import { useConnectedOneDrives } from '@/app/(private)/connections/hooks/useConnectedOneDrive';
import { useFileData, DriveProvider } from '@/app/(private)/files/hooks/useFileData';
import { useMimeType } from '@/app/(private)/files/hooks/useMimeType';
import { checkDuplicates } from '@/app/(private)/files/hooks/useDuplicates';
import type { FileData } from '@/app/(private)/files/types/File.types';

// ── Helpers ──────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatBytesShort(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function getMimeCategory(mimeType: string): string {
  if (mimeType.includes('image')) return 'Images';
  if (mimeType.includes('video')) return 'Videos';
  if (mimeType.includes('audio')) return 'Audio';
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) return 'Documents';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Spreadsheets';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentations';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return 'Archives';
  if (mimeType.includes('text') || mimeType.includes('code') || mimeType.includes('javascript') || mimeType.includes('json')) return 'Code/Text';
  return 'Other';
}

const CATEGORY_COLORS: Record<string, string> = {
  Documents: 'hsl(217, 91%, 60%)',
  Images: 'hsl(280, 80%, 55%)',
  Videos: 'hsl(320, 70%, 60%)',
  Audio: 'hsl(38, 92%, 50%)',
  Archives: 'hsl(160, 84%, 39%)',
  'Code/Text': 'hsl(252, 85%, 60%)',
  Spreadsheets: 'hsl(145, 63%, 42%)',
  Presentations: 'hsl(0, 84%, 60%)',
  Other: 'hsl(240, 12%, 70%)',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Documents: FileText,
  Images: Image,
  Videos: Video,
  Audio: Music,
  Archives: Archive,
  'Code/Text': Code2,
  Spreadsheets: Table2,
  Presentations: Presentation,
  Other: HelpCircle,
};

const SIZE_LABELS: Record<string, string> = {
  tiny: '< 1 MB',
  small: '1–10 MB',
  medium: '10–100 MB',
  large: '100 MB–1 GB',
  huge: '> 1 GB',
};

const SIZE_COLORS = [
  'hsl(217, 91%, 60%)',
  'hsl(252, 85%, 60%)',
  'hsl(280, 70%, 55%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
];

const AGE_COLORS = [
  'hsl(145, 63%, 42%)',
  'hsl(160, 84%, 39%)',
  'hsl(217, 91%, 60%)',
  'hsl(38, 92%, 50%)',
  'hsl(0, 84%, 60%)',
];

// ── Analytics computations (pure) ────────────────────────────

function computeStats(files: FileData[], duplicateData: any) {
  const totalStorage = files.reduce((sum, f) => sum + (f.fileSize || 0), 0);
  return {
    totalStorage,
    totalFiles: files.length,
    duplicateCount: duplicateData?.count || 0,
    savingsGB: duplicateData?.totalSavingsGB || 0,
    savingsBytes: duplicateData?.totalSavingsBytes || 0,
  };
}

function computeStorageByCategory(files: FileData[], totalStorage: number) {
  const map = new Map<string, { size: number; count: number }>();
  files.forEach((f) => {
    const cat = getMimeCategory(f.mimeType);
    const prev = map.get(cat) || { size: 0, count: 0 };
    map.set(cat, { size: prev.size + (f.fileSize || 0), count: prev.count + 1 });
  });
  return Array.from(map.entries())
    .map(([name, val]) => ({
      name,
      value: val.size,
      count: val.count,
      fill: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other,
      pct: totalStorage > 0 ? ((val.size / totalStorage) * 100).toFixed(1) : '0',
    }))
    .sort((a, b) => b.value - a.value);
}

function computeGrowthTimeline(files: FileData[]) {
  const map = new Map<string, number>();
  files.forEach((f) => {
    const d = new Date(f.fileCreatedTime);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => {
      const [y, m] = month.split('-');
      const label = new Date(Number.parseInt(y), Number.parseInt(m) - 1).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      return { month: label, count };
    });
}

function computeSizeDistribution(files: FileData[]) {
  const dist = { tiny: 0, small: 0, medium: 0, large: 0, huge: 0 };
  files.forEach((f) => {
    const size = f.fileSize || 0;
    if (size < 1024 * 1024) dist.tiny++;
    else if (size < 10 * 1024 * 1024) dist.small++;
    else if (size < 100 * 1024 * 1024) dist.medium++;
    else if (size < 1024 * 1024 * 1024) dist.large++;
    else dist.huge++;
  });
  const total = files.length;
  return Object.entries(dist).map(([key, value], i) => ({
    name: SIZE_LABELS[key],
    value,
    fill: SIZE_COLORS[i],
    pct: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
  }));
}

function computeAgeDistribution(files: FileData[]) {
  const now = Date.now();
  const buckets = [
    { label: '< 1 month', max: 30 * 24 * 60 * 60 * 1000, count: 0 },
    { label: '1–6 months', max: 180 * 24 * 60 * 60 * 1000, count: 0 },
    { label: '6–12 months', max: 365 * 24 * 60 * 60 * 1000, count: 0 },
    { label: '1–2 years', max: 730 * 24 * 60 * 60 * 1000, count: 0 },
    { label: '2+ years', max: Infinity, count: 0 },
  ];
  files.forEach((f) => {
    const age = now - new Date(f.fileCreatedTime).getTime();
    for (const bucket of buckets) {
      if (age < bucket.max) { bucket.count++; break; }
    }
  });
  return buckets.map((b, i) => ({ name: b.label, value: b.count, fill: AGE_COLORS[i] }));
}

function computeDuplicatesByType(duplicateData: any) {
  if (!duplicateData?.duplicateGroups) return [];
  const map = new Map<string, number>();
  duplicateData.duplicateGroups.forEach((g: any) => {
    g.files.forEach((f: any) => {
      const cat = getMimeCategory(f.mimeType);
      map.set(cat, (map.get(cat) || 0) + 1);
    });
  });
  return Array.from(map.entries())
    .map(([name, value]) => ({ name, value, fill: CATEGORY_COLORS[name] || CATEGORY_COLORS.Other }))
    .sort((a, b) => b.value - a.value);
}

function computeFreshness(files: FileData[]) {
  const now = Date.now();
  let viewed30 = 0, viewed90 = 0, viewed365 = 0, neverViewed = 0;
  files.forEach((f) => {
    if (!f.viewed_by_me_time) { neverViewed++; return; }
    const age = now - new Date(f.viewed_by_me_time).getTime();
    if (age < 30 * 864e5) viewed30++;
    else if (age < 90 * 864e5) viewed90++;
    else if (age < 365 * 864e5) viewed365++;
    else neverViewed++;
  });
  const total = files.length || 1;
  const score = Math.round(((viewed30 + viewed90 * 0.5) / total) * 100);
  return { viewed30, viewed90, viewed365, neverViewed, score };
}

function useAnalyticsData(files: FileData[], duplicateData: any) {
  const stats = useMemo(() => computeStats(files, duplicateData), [files, duplicateData]);
  const storageByCat = useMemo(
    () => computeStorageByCategory(files, stats.totalStorage),
    [files, stats.totalStorage]
  );
  const growthTimeline = useMemo(() => computeGrowthTimeline(files), [files]);
  const sizeDistribution = useMemo(() => computeSizeDistribution(files), [files]);
  const ageDistribution = useMemo(() => computeAgeDistribution(files), [files]);
  const duplicatesByType = useMemo(() => computeDuplicatesByType(duplicateData), [duplicateData]);
  const topLargest = useMemo(
    () => [...files].sort((a, b) => (b.fileSize || 0) - (a.fileSize || 0)).slice(0, 10),
    [files]
  );
  const freshnessStats = useMemo(() => computeFreshness(files), [files]);

  return {
    stats,
    storageByCat,
    growthTimeline,
    sizeDistribution,
    ageDistribution,
    duplicatesByType,
    topLargest,
    freshnessStats,
  };
}

type AnalyticsData = ReturnType<typeof useAnalyticsData>;

// ── Provider Icons ───────────────────────────────────────────

const GoogleDriveIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4.433 21L8.868 13.5H21.567L17.133 21H4.433Z" fill="#0066DA" />
    <path d="M2 17.5L6.434 10H11.301L6.867 17.5H2Z" fill="#00AC47" />
    <path d="M8.867 13.5L13.301 6H17.301L12.867 13.5H8.867Z" fill="#EA4335" />
    <path d="M13.3 6H17.3L21.567 13.5H17.567L13.3 6Z" fill="#FFBA00" />
    <path d="M6.433 10L10.867 17.5H6.867L2 10H6.433Z" fill="#00832D" />
    <path d="M17.133 21H12.867L8.867 13.5H12.867L17.133 21Z" fill="#2684FC" />
  </svg>
);

const OneDriveIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.507 7.524a5.985 5.985 0 0 0-3.507-1.124 6 6 0 0 0-5.788 4.43A4.5 4.5 0 0 0 5.5 19.5h13a3.5 3.5 0 0 0 .648-6.937 6 6 0 0 0-4.641-5.039Z"
      fill="#0078D4"
    />
  </svg>
);

// ── Provider + Drive Selector ────────────────────────────────

function ProviderDriveSelector({
  activeProvider,
  setActiveProvider,
  currentDrives,
  selectedDriveId,
  setSelectedDriveId,
  isDrivesLoading,
}: Readonly<{
  activeProvider: DriveProvider;
  setActiveProvider: (p: DriveProvider) => void;
  currentDrives: any[];
  selectedDriveId: string | null;
  setSelectedDriveId: (id: string) => void;
  isDrivesLoading: boolean;
}>) {
  const getDriveLabel = (drive: any) =>
    activeProvider === 'google'
      ? drive.gmailAccount
      : drive.onedriveAccount || drive.email || drive.userPrincipalName || drive.displayName || drive.id;

  const providerName = activeProvider === 'google' ? 'Google Drive' : 'OneDrive';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-4 space-y-3">

          {/* Provider toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
              <div className="w-5 h-5 rounded bg-accent flex items-center justify-center">
                <HardDrive className="w-3 h-3 text-primary" />
              </div>
              Provider
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setActiveProvider('google')}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeProvider === 'google'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                <GoogleDriveIcon />
                Google Drive
              </button>
              <button
                onClick={() => setActiveProvider('onedrive')}
                className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                  activeProvider === 'onedrive'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                <OneDriveIcon />
                OneDrive
              </button>
            </div>
          </div>

          {/* Connected accounts for active provider */}
          {!isDrivesLoading && currentDrives.length > 0 && (
            <>
              <div className="h-px bg-border/40" />
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground shrink-0">Account</span>
                <div className="flex gap-1.5 flex-wrap">
                  {currentDrives.map((drive: any) => (
                    <button
                      key={drive.id}
                      onClick={() => setSelectedDriveId(drive.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                        selectedDriveId === drive.id
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {getDriveLabel(drive)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* No accounts connected for this provider */}
          {!isDrivesLoading && currentDrives.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No {providerName} accounts connected.
            </p>
          )}

        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Chart tooltips (module-level so they aren't redefined on render) ─────────

type ChartTooltipProps = {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: readonly any[];
};

function StorageTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium">{d.name}</p>
      <p className="text-muted-foreground">{formatBytes(d.value)} ({d.pct}%)</p>
      <p className="text-muted-foreground">{d.count} files</p>
    </div>
  );
}

function GrowthTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium">{payload[0].payload.month}</p>
      <p className="text-muted-foreground">{payload[0].value} files created</p>
    </div>
  );
}

function SizeTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium">{d.name}</p>
      <p className="text-muted-foreground">{d.value} files ({d.pct}%)</p>
    </div>
  );
}

function AgeTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium">{d.name}</p>
      <p className="text-muted-foreground">{d.value} files</p>
    </div>
  );
}

// ── Chart cards ──────────────────────────────────────────────

function StatsRow({ stats, freshnessStats }: Readonly<Pick<AnalyticsData, 'stats' | 'freshnessStats'>>) {
  const savingsValue = stats.savingsGB > 0
    ? `${stats.savingsGB.toFixed(2)} GB`
    : formatBytes(stats.savingsBytes);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
      <StatCard icon={FileText} label="Total Files" value={stats.totalFiles.toLocaleString()} subtitle="Synced from selected drive" accentFrom="hsl(217, 91%, 60%)" accentTo="hsl(240, 80%, 60%)" index={0} />
      <StatCard icon={HardDrive} label="Total Storage" value={formatBytesShort(stats.totalStorage)} subtitle="Across all file types" accentFrom="hsl(263, 70%, 55%)" accentTo="hsl(280, 75%, 55%)" index={1} />
      <StatCard icon={Eye} label="Freshness Score" value={`${freshnessStats.score}%`} subtitle={`${freshnessStats.viewed30} files viewed in 30d`} accentFrom="hsl(38, 92%, 50%)" accentTo="hsl(25, 90%, 53%)" index={2} />
      <StatCard icon={TrendingDown} label="Potential Savings" value={savingsValue} subtitle={`${stats.duplicateCount} duplicate files`} accentFrom="hsl(160, 84%, 39%)" accentTo="hsl(145, 63%, 42%)" index={3} />
    </div>
  );
}

function StorageByCategoryCard({ storageByCat, totalStorage }: Readonly<{ storageByCat: AnalyticsData['storageByCat']; totalStorage: number }>) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="rounded-xl border-border/50 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground text-sm">Storage by Category</h3>
        </div>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="relative w-52 h-52 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={storageByCat} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} strokeWidth={2} stroke="hsl(var(--card))">
                    {storageByCat.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip content={StorageTooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-lg font-display font-bold text-foreground">{formatBytesShort(totalStorage)}</p>
                  <p className="text-[10px] text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 flex-1 w-full">
              {storageByCat.map((item) => (
                <div key={item.name} className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-muted/40 transition-colors">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatBytes(item.value)} · {item.count} files</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function GrowthTimelineCard({ growthTimeline }: Readonly<{ growthTimeline: AnalyticsData['growthTimeline'] }>) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <Card className="rounded-xl border-border/50 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground text-sm">File Growth (Last 12 Months)</h3>
        </div>
        <CardContent className="p-6">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthTimeline} barSize={24}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={GrowthTooltip} />
                <Bar dataKey="count" fill="hsl(252, 85%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SizeDistributionCard({ sizeDistribution }: Readonly<{ sizeDistribution: AnalyticsData['sizeDistribution'] }>) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <Card className="rounded-xl border-border/50 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
          <HardDrive className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground text-sm">Size Distribution</h3>
        </div>
        <CardContent className="p-6">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizeDistribution} layout="vertical" barSize={18}>
                <XAxis type="number" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={SizeTooltip} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {sizeDistribution.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DuplicateAnalysisCard({ stats, duplicateData, duplicatesByType }: Readonly<{
  stats: AnalyticsData['stats'];
  duplicateData: any;
  duplicatesByType: AnalyticsData['duplicatesByType'];
}>) {
  const wastedSpace = stats.savingsGB > 0.01
    ? `${stats.savingsGB.toFixed(2)} GB`
    : formatBytes(stats.savingsBytes);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
      <Card className="rounded-xl border-border/50 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
          <Copy className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground text-sm">Duplicate Analysis</h3>
        </div>
        <CardContent className="p-6">
          {stats.duplicateCount === 0 ? (
            <div className="flex flex-col items-center justify-center h-[220px] text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <Copy className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-sm font-medium text-foreground">No duplicates found</p>
              <p className="text-xs text-muted-foreground mt-1">Your drive is clean!</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="relative w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Clean', value: stats.totalFiles - stats.duplicateCount },
                        { name: 'Duplicates', value: stats.duplicateCount },
                      ]}
                      dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={65} strokeWidth={2} stroke="hsl(var(--card))"
                    >
                      <Cell fill="hsl(145, 63%, 42%)" />
                      <Cell fill="hsl(0, 84%, 60%)" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-lg font-display font-bold text-red-500">{stats.duplicateCount}</p>
                    <p className="text-[10px] text-muted-foreground">Duplicates</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3 w-full">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-muted/40 p-3">
                    <p className="text-[10px] text-muted-foreground">Groups</p>
                    <p className="text-lg font-bold font-display text-foreground">{duplicateData?.duplicateGroups?.length || 0}</p>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <p className="text-[10px] text-red-600">Wasted Space</p>
                    <p className="text-lg font-bold font-display text-red-600">
                      {wastedSpace}
                    </p>
                  </div>
                </div>
                {duplicatesByType.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-muted-foreground font-medium">By type</p>
                    {duplicatesByType.slice(0, 4).map((d) => (
                      <div key={d.name} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.fill }} />
                        <span className="text-xs text-muted-foreground flex-1">{d.name}</span>
                        <span className="text-xs font-medium text-foreground">{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FileAgeCard({ ageDistribution }: Readonly<{ ageDistribution: AnalyticsData['ageDistribution'] }>) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
      <Card className="rounded-xl border-border/50 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground text-sm">File Age Distribution</h3>
        </div>
        <CardContent className="p-6">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageDistribution} barSize={28}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip content={AgeTooltip} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {ageDistribution.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FreshnessCard({ freshnessStats, totalFiles }: Readonly<{ freshnessStats: AnalyticsData['freshnessStats']; totalFiles: number }>) {
  let ringColor = 'hsl(0, 84%, 60%)';
  if (freshnessStats.score >= 60) ringColor = 'hsl(145, 63%, 42%)';
  else if (freshnessStats.score >= 30) ringColor = 'hsl(38, 92%, 50%)';
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
      <Card className="rounded-xl border-border/50 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground text-sm">File Freshness</h3>
        </div>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28 shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke={ringColor}
                  strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={`${freshnessStats.score * 2.51} 251`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xl font-display font-bold text-foreground">{freshnessStats.score}%</p>
                  <p className="text-[9px] text-muted-foreground">Fresh</p>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-2.5">
              <FreshnessRow label="Viewed in 30 days" value={freshnessStats.viewed30} color="hsl(145, 63%, 42%)" total={totalFiles} />
              <FreshnessRow label="Viewed in 90 days" value={freshnessStats.viewed90} color="hsl(217, 91%, 60%)" total={totalFiles} />
              <FreshnessRow label="Viewed in 1 year" value={freshnessStats.viewed365} color="hsl(38, 92%, 50%)" total={totalFiles} />
              <FreshnessRow label="Stale / Never viewed" value={freshnessStats.neverViewed} color="hsl(0, 84%, 60%)" total={totalFiles} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TopLargestFilesCard({ topLargest, totalStorage }: Readonly<{ topLargest: AnalyticsData['topLargest']; totalStorage: number }>) {
  const combined = topLargest.reduce((s, f) => s + (f.fileSize || 0), 0);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
      <Card className="rounded-xl border-border/50 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-display font-semibold text-foreground text-sm">Top 10 Largest Files</h3>
          </div>
          <Badge variant="secondary" className="text-[10px]">
            {formatBytesShort(combined)} combined
          </Badge>
        </div>
        <div className="divide-y divide-border/30">
          {topLargest.map((file, i) => (
            <TopLargestRow key={file.id} file={file} index={i} totalStorage={totalStorage} />
          ))}
        </div>
      </Card>
    </motion.div>
  );
}

function TopLargestRow({ file, index, totalStorage }: Readonly<{ file: FileData; index: number; totalStorage: number }>) {
  const pct = totalStorage > 0 ? ((file.fileSize || 0) / totalStorage) * 100 : 0;
  const Icon = CATEGORY_ICONS[getMimeCategory(file.mimeType)] || FileText;
  return (
    <div className="px-6 py-3.5 flex items-center gap-4 hover:bg-accent/30 transition-colors">
      <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">{index + 1}</span>
      <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{file.fileName}</p>
        <p className="text-[10px] text-muted-foreground truncate">{file.filePath}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-semibold text-foreground">{formatBytesShort(file.fileSize || 0)}</p>
        <p className="text-[10px] text-muted-foreground">{pct.toFixed(1)}% of total</p>
      </div>
      <div className="w-20 shrink-0 hidden sm:block">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
      </div>
      {file.web_view_link && (
        <a href={file.web_view_link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
}

// ── Dashboard (composition of cards) ─────────────────────────

function AnalyticsDashboard({ analytics, duplicateData }: Readonly<{ analytics: AnalyticsData; duplicateData: any }>) {
  const {
    stats,
    storageByCat,
    growthTimeline,
    sizeDistribution,
    ageDistribution,
    duplicatesByType,
    topLargest,
    freshnessStats,
  } = analytics;

  return (
    <>
      <StatsRow stats={stats} freshnessStats={freshnessStats} />

      {/* Row 1: Storage by Category + Growth Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <StorageByCategoryCard storageByCat={storageByCat} totalStorage={stats.totalStorage} />
        <GrowthTimelineCard growthTimeline={growthTimeline} />
      </div>

      {/* Row 2: Size Distribution + Duplicate Analysis */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SizeDistributionCard sizeDistribution={sizeDistribution} />
        <DuplicateAnalysisCard stats={stats} duplicateData={duplicateData} duplicatesByType={duplicatesByType} />
      </div>

      {/* Row 3: File Age + Freshness */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <FileAgeCard ageDistribution={ageDistribution} />
        <FreshnessCard freshnessStats={freshnessStats} totalFiles={stats.totalFiles} />
      </div>

      <TopLargestFilesCard topLargest={topLargest} totalStorage={stats.totalStorage} />
    </>
  );
}

// ── Main Component ───────────────────────────────────────────

export const AnalyticsContent = () => {
  const { userId } = useUserId();

  const [activeProvider, setActiveProvider] = useState<DriveProvider>('google');
  const [selectedDriveId, setSelectedDriveId] = useState<string | null>(null);

  const { data: googleDrivesData, isLoading: isGoogleDrivesLoading } = useConnectedDrives();
  const { data: oneDrivesData, isLoading: isOneDrivesLoading } = useConnectedOneDrives();

  const isGoogle = activeProvider === 'google';
  const currentDrives: any[] = useMemo(
    () => (isGoogle ? googleDrivesData?.drives : oneDrivesData?.drives) ?? [],
    [isGoogle, googleDrivesData, oneDrivesData]
  );
  const isDrivesLoading = isGoogle ? isGoogleDrivesLoading : isOneDrivesLoading;

  // When provider changes: immediately clear the old driveId, then pick the
  // first drive of the new provider (if already loaded). A separate effect
  // handles the case where drives load after the provider is already set.
  useEffect(() => {
    const firstId = currentDrives.length > 0 ? currentDrives[0].id : null;
    setSelectedDriveId(firstId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProvider]);

  // Auto-select first drive when drives finish loading (and none is selected yet)
  useEffect(() => {
    if (currentDrives.length > 0 && !selectedDriveId) {
      setSelectedDriveId(currentDrives[0].id);
    }
  }, [currentDrives, selectedDriveId]);

  const { data: fileData, isLoading: isFilesLoading } = useFileData(
    userId ?? undefined,
    selectedDriveId,
    activeProvider
  );
  const { isLoading: isMimeLoading } = useMimeType(
    userId,
    selectedDriveId,
    activeProvider
  );
  const { data: duplicateData, isLoading: isDuplicatesLoading } = checkDuplicates(
    userId ?? undefined,
    selectedDriveId,
    activeProvider
  );

  const files: FileData[] = fileData?.files || [];
  const isLoading = isFilesLoading || isMimeLoading || isDuplicatesLoading;
  const providerName = isGoogle ? 'Google Drive' : 'OneDrive';

  const analytics = useAnalyticsData(files, duplicateData);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 lg:p-10 space-y-8 max-w-[1400px]"
    >
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Deep insights into your cloud storage across all connected drives.
        </p>
      </motion.div>

      <ProviderDriveSelector
        activeProvider={activeProvider}
        setActiveProvider={setActiveProvider}
        currentDrives={currentDrives}
        selectedDriveId={selectedDriveId}
        setSelectedDriveId={setSelectedDriveId}
        isDrivesLoading={isDrivesLoading}
      />

      {/* ── Content ── */}
      <AnalyticsBody
        isLoading={isLoading}
        files={files}
        providerName={providerName}
        analytics={analytics}
        duplicateData={duplicateData}
      />
    </motion.div>
  );
};

function AnalyticsBody({ isLoading, files, providerName, analytics, duplicateData }: Readonly<{
  isLoading: boolean;
  files: FileData[];
  providerName: string;
  analytics: AnalyticsData;
  duplicateData: any;
}>) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Crunching your data…</p>
      </div>
    );
  }
  if (files.length === 0) {
    return (
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-1">No data yet</h3>
          <p className="text-sm text-muted-foreground">
            Connect a {providerName} account and sync your files to see analytics.
          </p>
        </CardContent>
      </Card>
    );
  }
  return <AnalyticsDashboard analytics={analytics} duplicateData={duplicateData} />;
}

// ── Sub-components ───────────────────────────────────────────

function StatCard({ icon: Icon, label, value, subtitle, accentFrom, accentTo, index }: Readonly<{
  icon: React.ElementType; label: string; value: string; subtitle: string;
  accentFrom: string; accentTo: string; index: number;
}>) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.06, duration: 0.4 }}>
      <Card className="rounded-xl border-border/50 overflow-hidden hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5 relative">
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: `linear-gradient(90deg, ${accentFrom}, ${accentTo})` }} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground tracking-wide">{label}</p>
              <p className="text-3xl font-display font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 opacity-80" style={{ background: `linear-gradient(135deg, ${accentFrom}, ${accentTo})` }}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function FreshnessRow({ label, value, color, total }: Readonly<{
  label: string; value: number; color: string; total: number;
}>) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-medium text-foreground">{value}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
