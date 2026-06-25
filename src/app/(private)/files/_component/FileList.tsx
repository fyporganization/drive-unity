"use client";

import {
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  File,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileData } from "@/app/(private)/files/types/File.types";
import {
  formatDate,
  formatFileSize,
  getMimeTypeColor,
  getMimeTypeLabel,
} from "../utils/helper";

interface FileListProps {
  files: FileData[];
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes("image")) return ImageIcon;
  if (mimeType.includes("video")) return Video;
  if (mimeType.includes("audio")) return Music;
  if (mimeType.includes("pdf") || mimeType.includes("document"))
    return FileText;
  return File;
};

const categoryColors: Record<string, string> = {
  Document: "bg-blue-50 text-blue-700 border-blue-200/60",
  Image: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Video: "bg-purple-50 text-purple-700 border-purple-200/60",
  Audio: "bg-amber-50 text-amber-700 border-amber-200/60",
  Archive: "bg-slate-100 text-slate-700 border-slate-200/60",
  Code: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  Spreadsheet: "bg-teal-50 text-teal-700 border-teal-200/60",
  Presentation: "bg-rose-50 text-rose-700 border-rose-200/60",
};

export const FileList: React.FC<FileListProps> = ({ files }) => {
  // Supports both Google Drive (web_view_link) and OneDrive (webViewLink)
  const getViewLink = (file: FileData): string | null =>
    file.web_view_link ?? file.webViewLink ?? null;

  const handleRowClick = (file: FileData) => {
    const link = getViewLink(file);
    if (link) {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  if (files.length === 0) {
    return (
      <Card className="rounded-xl border-border/50 p-16 text-center">
        <p className="text-sm text-muted-foreground">No files found</p>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border-border/50 shadow-soft overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-muted/30">
              <th className="text-left px-6 py-3 font-medium text-muted-foreground">
                File Name
              </th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                Type
              </th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground hidden md:table-cell">
                Size
              </th>
              <th className="text-left px-6 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                Created
              </th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const Icon = getFileIcon(file.mimeType);
              const typeLabel = getMimeTypeLabel(file.mimeType);
              return (
                <tr
                  key={file.id}
                  className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(file)}
                >
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground truncate max-w-[200px]">
                        {file.fileName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-3.5 hidden sm:table-cell">
                    <Badge
                      variant="secondary"
                      className="text-[11px]"
                    >
                      {typeLabel}
                    </Badge>
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground hidden md:table-cell">
                    {formatFileSize(file.fileSize)}
                  </td>
                  <td className="px-6 py-3.5 text-muted-foreground hidden lg:table-cell">
                    {formatDate(file.fileCreatedTime)}
                  </td>
                  <td className="px-6 py-3.5 text-right">
                    {getViewLink(file) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs gap-1.5 text-primary h-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            getViewLink(file)!,
                            "_blank",
                            "noopener,noreferrer"
                          );
                        }}
                      >
                        <ExternalLink className="w-3 h-3" />
                        View
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};