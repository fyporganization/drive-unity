"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import {
  SlidersHorizontal,
  CalendarIcon,
  HardDrive,
  FileType,
  Copy,
  X,
  Check,
  Loader2,
  Search,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FiltersModalProps } from "@/app/(private)/files/types/File.types";

/** Parse a "YYYY-MM-DD" string to a Date (noon to avoid timezone shifts). */
function parseYMD(str: string): Date {
  return parse(str, "yyyy-MM-dd", new Date());
}

/** A single date picker field using Popover + Calendar. */
function DatePickerField({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Pick a date",
}: {
  value?: string;
  onChange: (dateStr: string) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholder?: string;
}) {
  const selected = value ? parseYMD(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-10 justify-start text-left font-normal rounded-lg border-border/50 px-3",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-60" />
          {selected ? (
            <span className="text-sm">{format(selected, "MMM d, yyyy")}</span>
          ) : (
            <span className="text-sm">{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-[200]" align="start">
        <CalendarComponent
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
            }
          }}
          disabled={(date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          defaultMonth={selected}
        />
      </PopoverContent>
    </Popover>
  );
}

/** A searchable multi-select dropdown using Popover + checkboxes. */
function MultiSelectField({
  options,
  value,
  onChange,
  placeholder = "Select items...",
}: {
  options: { value: string; label: string; category?: string }[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q) ||
        o.category?.toLowerCase().includes(q)
    );
  }, [options, search]);

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, typeof options>();
    for (const opt of filtered) {
      const cat = opt.category || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(opt);
    }
    return map;
  }, [filtered]);

  const toggle = (val: string) => {
    onChange(
      value.includes(val) ? value.filter((v) => v !== val) : [...value, val]
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full h-auto min-h-[40px] justify-between text-left font-normal rounded-lg border-border/50 px-3 py-2",
            value.length === 0 && "text-muted-foreground"
          )}
        >
          <div className="flex-1 flex flex-wrap gap-1 mr-2">
            {value.length === 0 ? (
              <span className="text-sm">{placeholder}</span>
            ) : value.length <= 3 ? (
              value.map((v) => {
                const opt = options.find((o) => o.value === v);
                return (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-md"
                  >
                    {opt?.label || v}
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        toggle(v);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          e.preventDefault();
                          toggle(v);
                        }
                      }}
                      className="hover:text-primary/70 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </span>
                  </span>
                );
              })
            ) : (
              <span className="text-sm">
                {value.length} types selected
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0 z-[200]"
        align="start"
      >
        {/* Search */}
        <div className="p-2 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search file types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm border-border/50 rounded-md"
            />
          </div>
        </div>

        {/* Options */}
        <div className="max-h-[200px] overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No file types found
            </p>
          ) : (
            Array.from(grouped.entries()).map(([category, items]) => (
              <div key={category}>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-2 pb-1">
                  {category}
                </p>
                {items.map((opt) => {
                  const selected = value.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className={cn(
                        "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md transition-colors text-left",
                        selected
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors",
                          selected
                            ? "bg-primary border-primary"
                            : "border-border"
                        )}
                      >
                        {selected && (
                          <Check className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {value.length > 0 && (
          <div className="p-2 border-t border-border/50">
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center py-1"
            >
              Clear all ({value.length})
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

interface ExtendedFiltersModalProps extends FiltersModalProps {
  showDuplicatesOnly: boolean;
  onShowDuplicatesChange: (value: boolean) => void;
  duplicateInfo: {
    duplicateCount: number;
    duplicateGroups: number;
  };
  isDuplicatesLoading: boolean;
}

export const FiltersModal: React.FC<ExtendedFiltersModalProps> = ({
  opened,
  onClose,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  mimeTypeOptions,
  isMimeTypeLoading,
  dateRangeInfo,
  showDuplicatesOnly,
  onShowDuplicatesChange,
  duplicateInfo,
  isDuplicatesLoading,
}) => {
  const handleApply = () => {
    onApplyFilters();
    onClose();
  };

  const handleClear = () => {
    onClearFilters();
  };

  const activeCount = [
    filters.dateRange?.startDate || filters.dateRange?.endDate ? 1 : 0,
    filters.fileSize?.minSize || filters.fileSize?.maxSize ? 1 : 0,
    filters.mimeTypes?.length ? 1 : 0,
    showDuplicatesOnly ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <Dialog open={opened} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl border-border/50 shadow-elevated">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="font-display text-lg font-bold text-foreground">
                Advanced Filters
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Refine your file search
              </DialogDescription>
              {activeCount > 0 && (
                <Badge variant="secondary" className="text-[10px] mt-1">
                  {activeCount} active
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Duplicate Files */}
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                <Copy className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Duplicate Files
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm text-foreground">
                  Show duplicates only
                </p>
                <p className="text-xs text-muted-foreground">
                  {isDuplicatesLoading
                    ? "Scanning for duplicates..."
                    : duplicateInfo.duplicateCount > 0
                    ? `${duplicateInfo.duplicateCount} files in ${duplicateInfo.duplicateGroups} groups`
                    : "No duplicates found"}
                </p>
              </div>
              <Switch
                checked={showDuplicatesOnly}
                onCheckedChange={onShowDuplicatesChange}
                disabled={
                  isDuplicatesLoading || duplicateInfo.duplicateCount === 0
                }
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                Date Range
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Start Date
                </Label>
                <DatePickerField
                  value={filters.dateRange?.startDate}
                  onChange={(dateStr) =>
                    onFiltersChange({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        startDate: dateStr,
                      },
                    })
                  }
                  maxDate={
                    filters.dateRange?.endDate
                      ? parseYMD(filters.dateRange.endDate)
                      : undefined
                  }
                  placeholder="Pick start date"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  End Date
                </Label>
                <DatePickerField
                  value={filters.dateRange?.endDate}
                  onChange={(dateStr) =>
                    onFiltersChange({
                      ...filters,
                      dateRange: {
                        ...filters.dateRange,
                        endDate: dateStr,
                      },
                    })
                  }
                  minDate={
                    filters.dateRange?.startDate
                      ? parseYMD(filters.dateRange.startDate)
                      : undefined
                  }
                  placeholder="Pick end date"
                />
              </div>
            </div>
          </div>

          {/* File Size */}
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <HardDrive className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                File Size
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Min Size (bytes)
                </Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g., 1024"
                  value={filters.fileSize?.minSize ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const num = raw === "" ? undefined : Number(raw);
                    onFiltersChange({
                      ...filters,
                      fileSize: {
                        ...filters.fileSize,
                        minSize:
                          typeof num === "number" && Number.isFinite(num) ? num : undefined,
                      },
                    });
                  }}
                  min={0}
                  className="h-10 rounded-lg border-border/50 bg-background text-sm px-3 focus:ring-2 focus:ring-ring focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">
                  Max Size (bytes)
                </Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g., 1048576"
                  value={filters.fileSize?.maxSize ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const num = raw === "" ? undefined : Number(raw);
                    onFiltersChange({
                      ...filters,
                      fileSize: {
                        ...filters.fileSize,
                        maxSize:
                          typeof num === "number" && Number.isFinite(num) ? num : undefined,
                      },
                    });
                  }}
                  min={filters.fileSize?.minSize || 0}
                  className="h-10 rounded-lg border-border/50 bg-background text-sm px-3 focus:ring-2 focus:ring-ring focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* File Types */}
          <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileType className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">
                File Types
              </span>
            </div>
            {isMimeTypeLoading ? (
              <div className="flex items-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading file types...
              </div>
            ) : (
              <MultiSelectField
                placeholder="Choose one or more file types"
                options={mimeTypeOptions}
                value={filters.mimeTypes || []}
                onChange={(value) =>
                  onFiltersChange({
                    ...filters,
                    mimeTypes: value,
                  })
                }
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            Clear All
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="rounded-lg gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
