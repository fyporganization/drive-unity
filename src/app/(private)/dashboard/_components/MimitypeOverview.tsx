"use client";

import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, BarChart3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMimeTypesAction } from "@/lib/actions/drive-filters.action";

interface MimeTypeInfo {
  value: string;
  label: string;
  category: string;
}

interface MimeTypeResponse {
  success: boolean;
  mimeTypes: MimeTypeInfo[];
  groupedByCategory?: Record<string, MimeTypeInfo[]>;
  totalTypes: number;
}

interface DriveAccount {
  id: string;
  gmailAccount?: string;
  onedriveAccount?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    Documents: "hsl(217 91% 60%)",
    Images: "hsl(280 80% 55%)",
    Videos: "hsl(320 70% 60%)",
    Audio: "hsl(38 92% 50%)",
    Archives: "hsl(160 84% 39%)",
    Code: "hsl(252 85% 60%)",
    Spreadsheets: "hsl(145 63% 42%)",
    Presentations: "hsl(0 84% 60%)",
    Folders: "hsl(240 8% 46%)",
    Other: "hsl(240 12% 70%)",
  };
  return colorMap[category] || "hsl(240 12% 70%)";
};

const fetchMimeTypes = async (
  userId: string,
  driveId: string,
  provider: "google" | "onedrive"
): Promise<MimeTypeResponse> => {
  const result = await getMimeTypesAction(provider, { userId, driveId });
  if (!result.success) return { success: false, mimeTypes: [], totalTypes: 0 };
  return result;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function MimeTypeOverview({
  userId,
  googleAccounts,
  onedriveAccounts,
}: {
  userId: any;
  googleAccounts: DriveAccount[];
  onedriveAccounts: DriveAccount[];
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const driveOptions = useMemo(() => {
    const google = googleAccounts.map((a) => ({
      value: a.id,
      label: a.gmailAccount ?? a.id,
      provider: "google" as const,
    }));
    const onedrive = onedriveAccounts.map((a) => ({
      value: a.id,
      label: a.onedriveAccount ?? a.id,
      provider: "onedrive" as const,
    }));
    return [...google, ...onedrive];
  }, [googleAccounts, onedriveAccounts]);

  const [selectedValue, setSelectedValue] = useState<string>("");

  useEffect(() => {
    if (driveOptions.length > 0 && !selectedValue) {
      setSelectedValue(driveOptions[0].value);
    }
  }, [driveOptions, selectedValue]);

  const selectedOption = driveOptions.find((o) => o.value === selectedValue);

  const { data, isLoading, isError } = useQuery<MimeTypeResponse>({
    queryKey: ["mimeTypes", userId, selectedValue, selectedOption?.provider],
    queryFn: () =>
      fetchMimeTypes(userId, selectedValue, selectedOption?.provider ?? "google"),
    enabled: !!userId && !!selectedValue,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

  const groupedData = useMemo(() => {
    if (data?.groupedByCategory && Object.keys(data.groupedByCategory).length > 0) {
      return data.groupedByCategory;
    }
    if (data?.mimeTypes && data.mimeTypes.length > 0) {
      const grouped: Record<string, MimeTypeInfo[]> = {};
      data.mimeTypes.forEach((mt) => {
        if (!grouped[mt.category]) grouped[mt.category] = [];
        grouped[mt.category].push(mt);
      });
      return grouped;
    }
    return {};
  }, [data]);

  if (isLoading || !selectedValue) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl bg-card border border-border/50 p-6"
      >
        <div className="h-4 w-36 rounded bg-muted shimmer mb-6" />
        <div className="flex items-center justify-center h-64">
          <div className="w-44 h-44 rounded-full border-4 border-muted shimmer" />
        </div>
      </motion.div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl bg-card border border-destructive/20 p-6">
        <p className="text-sm text-destructive font-medium">Failed to load file types</p>
      </div>
    );
  }

  const categories = Object.keys(groupedData);
  const totalTypes = data?.totalTypes || 0;
  const hasData = categories.length > 0;

  if (!hasData) {
    return (
      <div className="rounded-xl bg-card border border-border/50 p-6 shadow-soft">
        {driveOptions.length > 1 && (
          <DriveSelector
            options={driveOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            className="mb-4"
          />
        )}
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            No file type data available yet.
            <br />
            Connect a drive and sync files to see the distribution.
          </p>
        </div>
      </div>
    );
  }

  const chartData = categories
    .map((category) => ({
      name: category,
      value: groupedData[category].length,
      percentage:
        totalTypes > 0
          ? ((groupedData[category].length / totalTypes) * 100).toFixed(1)
          : "0",
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.value - a.value);

  const activeData = activeIndex !== null ? chartData[activeIndex] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.4 }}
      className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-soft"
    >
      <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <BarChart3 className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground text-sm">File Types</h3>
        </div>
        {driveOptions.length > 1 && (
          <DriveSelector
            options={driveOptions}
            value={selectedValue}
            onChange={setSelectedValue}
            className="w-44 h-8"
          />
        )}
      </div>

      <div className="p-6">
        {selectedOption && (
          <div className="mb-4 flex items-center gap-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              selectedOption.provider === "onedrive"
                ? "bg-blue-50 text-blue-600"
                : "bg-green-50 text-green-700"
            }`}>
              {selectedOption.provider === "onedrive" ? "OneDrive" : "Google Drive"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {selectedOption.label}
            </span>
          </div>
        )}

        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="relative w-60 h-60 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={68}
                  outerRadius={96}
                  paddingAngle={2}
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  animationDuration={800}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      stroke="transparent"
                      style={{
                        cursor: "pointer",
                        opacity:
                          activeIndex === null || activeIndex === index ? 1 : 0.35,
                        transition: "opacity 0.2s ease",
                      }}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <AnimatePresence mode="wait">
                  {activeData ? (
                    <motion.div
                      key={activeData.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                    >
                      <p className="text-lg font-display font-bold text-foreground">
                        {activeData.value}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {activeData.percentage}%
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="total"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.12 }}
                    >
                      <p className="text-2xl font-display font-bold text-foreground">
                        {totalTypes}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Total Types</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-1.5 flex-1 w-full">
            {chartData.map((item, i) => {
              const isActive = activeIndex === i;
              return (
                <button
                  key={item.name}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-left transition-all duration-150 ${
                    isActive ? "bg-accent/50" : "hover:bg-muted/40"
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.value} ({item.percentage}%)
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Reusable drive selector ───────────────────────────────────────────────────

function DriveSelector({
  options,
  value,
  onChange,
  className = "",
}: {
  options: { value: string; label: string; provider: "google" | "onedrive" }[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`border-border/50 text-xs rounded-md bg-background ${className}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-border/50">
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            <span className="flex items-center gap-2">
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                opt.provider === "onedrive"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-green-100 text-green-700"
              }`}>
                {opt.provider === "onedrive" ? "OD" : "GD"}
              </span>
              {opt.label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}