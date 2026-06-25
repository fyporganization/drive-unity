"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Upload, FileEdit, Trash2, ArrowRight, Clock } from "lucide-react";

const activities = [
  {
    id: 1,
    type: "uploaded" as const,
    fileName: "Project_Proposal_V3.pdf",
    location: "Google Drive",
    timestamp: "2 mins ago",
  },
  {
    id: 2,
    type: "modified" as const,
    fileName: "Budget_Report_2024.xlsx",
    location: "Google Drive",
    timestamp: "1 hour ago",
  },
  {
    id: 3,
    type: "deleted" as const,
    fileName: "Old_Presentation.pptx",
    location: "Google Drive",
    timestamp: "3 hours ago",
  },
  {
    id: 4,
    type: "uploaded" as const,
    fileName: "Brand-Guidelines-v3.fig",
    location: "Design / Brand",
    timestamp: "5 hours ago",
  },
  {
    id: 5,
    type: "modified" as const,
    fileName: "Team-OKRs-Q1.xlsx",
    location: "Management / OKRs",
    timestamp: "8 hours ago",
  },
];

const typeConfig = {
  uploaded: {
    icon: Upload,
    label: "Uploaded",
    color: "text-blue-600",
    badgeBg: "bg-blue-50 text-blue-600",
  },
  modified: {
    icon: FileEdit,
    label: "Modified",
    color: "text-emerald-600",
    badgeBg: "bg-emerald-50 text-emerald-600",
  },
  deleted: {
    icon: Trash2,
    label: "Deleted",
    color: "text-red-500",
    badgeBg: "bg-red-50 text-red-500",
  },
};

export default function RecentActivity() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.4 }}
      className="rounded-xl bg-card border border-border/50 overflow-hidden shadow-soft"
    >
      {/* Header */}
      <div className="px-6 py-4 border-b border-border/40 flex items-center gap-2.5">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <h3 className="font-display font-semibold text-foreground text-sm">
          Recent Activity
        </h3>
      </div>

      {/* Activity list */}
      <div>
        {activities.map((activity, i) => {
          const config = typeConfig[activity.type];
          const Icon = config.icon;

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
              className="group px-6 py-3.5 flex items-center gap-3.5 hover:bg-accent/30 transition-colors duration-150 cursor-pointer border-b border-border/20 last:border-b-0"
            >
              {/* Icon */}
              <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center shrink-0">
                <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {activity.fileName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.location}
                </p>
              </div>

              {/* Badge + Timestamp */}
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${config.badgeBg}`}
                >
                  {config.label}
                </span>
                <p className="text-[11px] text-muted-foreground hidden sm:block">
                  {activity.timestamp}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all duration-150 shrink-0" />
            </motion.div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border/40">
        <Link
          href="/files"
          className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
        >
          View all activity
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </motion.div>
  );
}
