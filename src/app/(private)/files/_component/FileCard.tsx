"use client";

import { FileText, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCardProps } from "@/app/(private)/files/types/File.types";
import {
  formatDate,
  formatFileSize,
  getMimeTypeLabel,
} from "@/app/(private)/files/utils/helper";

export const FileCard: React.FC<FileCardProps> = ({ file, onClick }) => {
  const handleCardClick = () => {
    if (file.webViewLink) {
      window.open(file.webViewLink, "_blank", "noopener,noreferrer");
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      className="rounded-xl border-border/50 shadow-soft hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">
              {file.fileName}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDate(file.fileCreatedTime)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {getMimeTypeLabel(file.mimeType)}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatFileSize(file.fileSize)}
          </span>
        </div>
        {file.webViewLink && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-xs gap-1.5 text-primary h-8"
            onClick={(e) => {
              e.stopPropagation();
              window.open(file.webViewLink ?? undefined, "_blank", "noopener,noreferrer");
            }}
          >
            <ExternalLink className="w-3 h-3" />
            Open in Drive
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
