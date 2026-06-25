'use server';

import { db } from "@/lib/db";

export type DriveProvider = "google" | "onedrive";

const PROVIDER_CONFIG = {
  google: {
    accountField: "googleDriveAccountId",
    select: {
      id: true,
      fileId: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      fileCreatedTime: true,
      viewed_by_me_time: true,
      filePath: true,
      web_view_link: true,
      thumbnail_link: true,
      md5Checksum: true,
      userId: true,
      updatedAt: true,
    },
  },
  onedrive: {
    accountField: "oneDriveAccountId",
    select: {
      id: true,
      fileId: true,
      fileName: true,
      mimeType: true,
      fileSize: true,
      fileCreatedTime: true,
      last_modified_time: true,
      filePath: true,
      webViewLink: true,
      md5Checksum: true,
      userId: true,
      updatedAt: true,
    },
  },
} as const;

type ActionError = { success: false; message: string };

function validateRequired(
  fields: Record<string, string | null | undefined>
): ActionError | null {
  for (const [label, value] of Object.entries(fields)) {
    if (!value || value.trim().length === 0) {
      return { success: false, message: `${label} is required` };
    }
  }
  return null;
}

function toActionError(error: unknown): ActionError {
  return {
    success: false,
    message: error instanceof Error ? error.message : "Unknown error",
  };
}

function getFileModel(provider: DriveProvider): any {
  return provider === "google" ? db.googleDriveFile : db.oneDriveFile;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

function serializeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

function mapFileSizes(files: any[]) {
  return files.map((file) => ({
    ...file,
    fileSize: file.fileSize ? Number(file.fileSize) : null,
  }));
}

function buildStatistics(files: any[]) {
  const totalSize = files.reduce(
    (sum, file) => sum + Number(file.fileSize || 0),
    0
  );
  const averageSize = files.length > 0 ? totalSize / files.length : 0;

  return {
    totalFiles: files.length,
    totalSize: totalSize,
    totalSizeFormatted: formatFileSize(totalSize),
    averageSize: averageSize,
    averageSizeFormatted: formatFileSize(averageSize),
  };
}

export async function filterByFileSizeAction(
  provider: DriveProvider,
  params: {
    userId?: string | null;
    driveId?: string | null;
    minSize?: number;
    maxSize?: number;
  }
) {
  const { userId, driveId, minSize, maxSize } = params;

  const invalid = validateRequired({ "User ID": userId, "Drive ID": driveId });
  if (invalid) return invalid;

  try {
    const { accountField, select } = PROVIDER_CONFIG[provider];

    const whereClause: any = {
      userId: userId,
      [accountField]: driveId,
    };

    if (minSize !== undefined || maxSize !== undefined) {
      whereClause.fileSize = {};
      if (minSize !== undefined) {
        whereClause.fileSize.gte = BigInt(minSize);
      }
      if (maxSize !== undefined) {
        whereClause.fileSize.lte = BigInt(maxSize);
      }
    }

    const files = await getFileModel(provider).findMany({
      where: whereClause,
      select,
      orderBy: {
        fileSize: "desc",
      },
    });

    const sizeDistribution = {
      tiny: 0,    // < 1MB
      small: 0,   // 1MB - 10MB
      medium: 0,  // 10MB - 100MB
      large: 0,   // 100MB - 1GB
      huge: 0,    // > 1GB
    };

    files.forEach((file: any) => {
      const size = Number(file.fileSize || 0);
      if (size < 1024 * 1024) {
        sizeDistribution.tiny++;
      } else if (size < 10 * 1024 * 1024) {
        sizeDistribution.small++;
      } else if (size < 100 * 1024 * 1024) {
        sizeDistribution.medium++;
      } else if (size < 1024 * 1024 * 1024) {
        sizeDistribution.large++;
      } else {
        sizeDistribution.huge++;
      }
    });

    return {
      success: true,
      count: files.length,
      files: mapFileSizes(files),
      filter: {
        minSize: minSize || null,
        maxSize: maxSize || null,
        minSizeFormatted: minSize ? formatFileSize(minSize) : null,
        maxSizeFormatted: maxSize ? formatFileSize(maxSize) : null,
      },
      statistics: buildStatistics(files),
      sizeDistribution,
    };
  } catch (error) {
    console.error("Failed to filter by file size:", error);
    return toActionError(error);
  }
}

export async function getDateRangeAction(
  provider: DriveProvider,
  params: { userId?: string | null; driveId?: string | null }
) {
  const { userId, driveId } = params;

  const invalid = validateRequired({ "User ID": userId, "Drive ID": driveId });
  if (invalid) return invalid;

  try {
    const { accountField } = PROVIDER_CONFIG[provider];

    const files = await getFileModel(provider).findMany({
      where: {
        userId: userId,
        [accountField]: driveId,
      },
      select: {
        fileCreatedTime: true,
      },
      orderBy: {
        fileCreatedTime: "asc",
      },
    });

    if (files.length === 0) {
      return {
        success: true,
        dateRanges: null,
        totalFiles: 0,
      };
    }

    const oldestDate = files[0].fileCreatedTime;
    const newestDate = files[files.length - 1].fileCreatedTime;

    return {
      success: true,
      dateRanges: {
        oldest: oldestDate.toISOString().split("T")[0],
        newest: newestDate.toISOString().split("T")[0],
        oldestFormatted: oldestDate.toLocaleDateString(),
        newestFormatted: newestDate.toLocaleDateString(),
      },
      totalFiles: files.length,
    };
  } catch (error) {
    console.error("Failed to fetch date range:", error);
    return toActionError(error);
  }
}

export async function filterByDateRangeAction(
  provider: DriveProvider,
  params: {
    userId?: string | null;
    driveId?: string | null;
    startDate?: string;
    endDate?: string;
  }
) {
  const { userId, driveId, startDate, endDate } = params;

  const invalid = validateRequired({ "User ID": userId, "Drive ID": driveId });
  if (invalid) return invalid;

  try {
    const { accountField, select } = PROVIDER_CONFIG[provider];

    const whereClause: any = {
      userId: userId,
      [accountField]: driveId,
    };

    if (startDate || endDate) {
      whereClause.fileCreatedTime = {};
      if (startDate) {
        whereClause.fileCreatedTime.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        whereClause.fileCreatedTime.lte = endDateTime;
      }
    }

    const files = await getFileModel(provider).findMany({
      where: whereClause,
      select,
      orderBy: {
        fileCreatedTime: "desc",
      },
    });

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const groupedByPeriod = {
      today: 0,
      yesterday: 0,
      lastWeek: 0,
      lastMonth: 0,
      older: 0,
    };

    files.forEach((file: any) => {
      const fileDate = new Date(file.fileCreatedTime);
      if (fileDate >= today) {
        groupedByPeriod.today++;
      } else if (fileDate >= yesterday) {
        groupedByPeriod.yesterday++;
      } else if (fileDate >= lastWeek) {
        groupedByPeriod.lastWeek++;
      } else if (fileDate >= lastMonth) {
        groupedByPeriod.lastMonth++;
      } else {
        groupedByPeriod.older++;
      }
    });

    const statistics = {
      ...buildStatistics(files),
      oldestFile: files.length > 0 ? {
        date: files[files.length - 1].fileCreatedTime.toISOString(),
        formatted: files[files.length - 1].fileCreatedTime.toLocaleDateString(),
      } : null,
      newestFile: files.length > 0 ? {
        date: files[0].fileCreatedTime.toISOString(),
        formatted: files[0].fileCreatedTime.toLocaleDateString(),
      } : null,
    };

    return {
      success: true,
      count: files.length,
      files: mapFileSizes(files),
      filter: {
        startDate: startDate || null,
        endDate: endDate || null,
        daysInRange: startDate && endDate
          ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
          : null,
      },
      statistics,
      groupedByPeriod,
      filesByMonth: [],
    };
  } catch (error) {
    console.error("Failed to filter by date range:", error);
    return toActionError(error);
  }
}

export async function findDuplicatesAction(
  provider: DriveProvider,
  params: { userId?: string | null; driveId?: string | null }
) {
  const { userId, driveId } = params;

  const invalid = validateRequired({ "User ID": userId });
  if (invalid) return invalid;

  try {
    const { accountField, select } = PROVIDER_CONFIG[provider];

    const files = await getFileModel(provider).findMany({
      where: {
        userId: userId,
        ...(driveId ? { [accountField]: driveId } : {}),
        md5Checksum: { not: null },
      },
      select,
    });

    const checksumMap = new Map<string, any[]>();

    files.forEach((file: any) => {
      if (file.md5Checksum) {
        if (!checksumMap.has(file.md5Checksum)) {
          checksumMap.set(file.md5Checksum, []);
        }
        checksumMap.get(file.md5Checksum)!.push(file);
      }
    });

    // Within each duplicate group, treat the OLDEST file as the original (the
    // one to keep) and the rest as deletable duplicates. UI + bulk-delete
    // action use the `isOriginal` flag to never touch the original.
    const duplicateGroups = Array.from(checksumMap.entries())
      .filter(([_, groupFiles]) => groupFiles.length > 1)
      .map(([checksum, groupFiles]) => {
        const sorted = [...groupFiles].sort((a, b) => {
          const ta = new Date(a.fileCreatedTime ?? 0).getTime();
          const tb = new Date(b.fileCreatedTime ?? 0).getTime();
          return ta - tb;
        });
        const original = { ...sorted[0], isOriginal: true };
        const duplicates = sorted.slice(1).map((f) => ({ ...f, isOriginal: false }));
        return {
          md5Checksum: checksum,
          count: groupFiles.length,
          duplicateCount: duplicates.length,
          original,
          duplicates,
          files: [original, ...duplicates],
        };
      });

    // `data` now contains ONLY deletable duplicates — UI's old assumption that
    // every row in `data` is a duplicate finally holds.
    const duplicateFiles = duplicateGroups.flatMap((group) => group.duplicates);

    const totalSavingsBytes = duplicateGroups.reduce((total, group) => {
      const groupSavings = group.duplicates.reduce((sum, file) => {
        return sum + (file.fileSize ? Number(file.fileSize) : 0);
      }, 0);
      return total + groupSavings;
    }, 0);

    const totalSavingsGB = totalSavingsBytes / (1024 * 1024 * 1024);

    const safeDuplicateFiles = serializeBigInt(duplicateFiles);
    const safeDuplicateGroups = serializeBigInt(duplicateGroups);

    return {
      success: true,
      data: safeDuplicateFiles,
      count: safeDuplicateFiles.length,
      duplicateGroups: safeDuplicateGroups,
      totalSavingsGB: Number(totalSavingsGB.toFixed(2)),
      totalSavingsBytes: totalSavingsBytes,
    };
  } catch (error) {
    console.error("Failed to check duplicates:", error);
    return toActionError(error);
  }
}

export async function getMimeTypesAction(
  provider: DriveProvider,
  params: { userId?: string | null; driveId?: string | null }
) {
  const { userId, driveId } = params;

  const invalid = validateRequired({ "User ID": userId, "Drive ID": driveId });
  if (invalid) return invalid;

  try {
    const { accountField } = PROVIDER_CONFIG[provider];

    const files = await getFileModel(provider).findMany({
      where: {
        userId: userId,
        [accountField]: driveId,
      },
      select: {
        mimeType: true,
      },
      distinct: ["mimeType"],
    });

    const mimeTypeMap = new Map<string, { value: string; label: string; category: string }>();

    files.forEach((file: any) => {
      if (!mimeTypeMap.has(file.mimeType)) {
        mimeTypeMap.set(file.mimeType, {
          value: file.mimeType,
          label: getMimeTypeLabel(file.mimeType),
          category: getMimeTypeCategory(file.mimeType),
        });
      }
    });

    const mimeTypes = Array.from(mimeTypeMap.values());

    const groupedByCategory = mimeTypes.reduce((acc, mt) => {
      if (!acc[mt.category]) {
        acc[mt.category] = [];
      }
      acc[mt.category].push(mt);
      return acc;
    }, {} as Record<string, typeof mimeTypes>);

    return {
      success: true,
      mimeTypes: mimeTypes,
      groupedByCategory: groupedByCategory,
      totalTypes: mimeTypes.length,
    };
  } catch (error) {
    console.error("Failed to fetch MIME types:", error);
    return toActionError(error);
  }
}

export async function smartSearchAction(
  provider: DriveProvider,
  params: { userId?: string | null; driveId?: string | null; query?: string }
) {
  const { userId, driveId, query } = params;

  const invalid = validateRequired({
    "User ID": userId,
    "Drive ID": driveId,
    "Search query": query,
  });
  if (invalid) return invalid;

  try {
    const { accountField, select } = PROVIDER_CONFIG[provider];

    const searchTerms = query!.toLowerCase().split(" ").filter((term: string) => term.length > 0);

    const files = await getFileModel(provider).findMany({
      where: {
        userId: userId,
        [accountField]: driveId,
        OR: [
          { fileName: { contains: query, mode: "insensitive" } },
          { mimeType: { contains: query, mode: "insensitive" } },
          { filePath: { contains: query, mode: "insensitive" } },
        ],
      },
      select,
      orderBy: {
        fileCreatedTime: "desc",
      },
    });

    return {
      success: true,
      query: query,
      count: files.length,
      files: mapFileSizes(files),
      suggestions: null,
      statistics: buildStatistics(files),
      searchInfo: {
        searchTerms: searchTerms,
        matchedTerms: searchTerms.length,
        hasExactMatch: true,
        topScore: 1,
      },
    };
  } catch (error) {
    console.error("Failed to perform smart search:", error);
    return toActionError(error);
  }
}

function getMimeTypeLabel(mimeType: string): string {
  const subType = mimeType.split("/")[1] || "";

  if (mimeType.includes("google-apps.document")) return "Google Doc";
  if (mimeType.includes("google-apps.spreadsheet")) return "Google Sheet";
  if (mimeType.includes("google-apps.presentation")) return "Google Slides";
  if (mimeType.includes("google-apps.folder")) return "Folder";

  if (mimeType.includes("officedocument.wordprocessingml")) return "Word Document";
  if (mimeType.includes("officedocument.spreadsheetml")) return "Excel Spreadsheet";
  if (mimeType.includes("officedocument.presentationml")) return "PowerPoint Presentation";

  if (mimeType.includes("pdf")) return "PDF";
  if (mimeType.includes("ms-word") || subType.includes("word")) return "Word";
  if (mimeType.includes("ms-excel") || subType.includes("excel")) return "Excel";
  if (mimeType.includes("ms-powerpoint") || subType.includes("powerpoint")) return "PowerPoint";

  return subType.toUpperCase().replace(/[^a-zA-Z0-9]/g, " ");
}

function getMimeTypeCategory(mimeType: string): string {
  if (mimeType.includes("image")) return "Images";
  if (mimeType.includes("video")) return "Videos";
  if (mimeType.includes("audio")) return "Audio";
  if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("word")) return "Documents";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "Spreadsheets";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "Presentations";
  if (mimeType.includes("zip") || mimeType.includes("rar") || mimeType.includes("compressed")) return "Archives";
  if (mimeType.includes("text")) return "Text Files";
  return "Other";
}
