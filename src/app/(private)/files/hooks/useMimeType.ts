import { useQuery } from "@tanstack/react-query";
import { MimeTypeResponse } from "@/app/(private)/files/types/File.types";
import { getMimeTypesAction } from "@/lib/actions/drive-filters.action";
import { DriveProvider } from "./useFileData";

export const useMimeType = (
  userId: any,
  driveId?: string | null,
  provider: DriveProvider = "google"
) => {
  return useQuery({
    queryKey: ["mimeTypes", userId, driveId, provider],
    queryFn: async () => {
      if (!driveId) {
        return { mimeTypes: [], groupedByCategory: {}, totalTypes: 0 };
      }

      const data = (await getMimeTypesAction(provider, {
        userId,
        driveId,
      })) as unknown as MimeTypeResponse;

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch MIME types");
      }

      return {
        mimeTypes: data.mimeTypes,
        groupedByCategory: data.groupedByCategory,
        totalTypes: data.totalTypes,
      };
    },
    enabled: !!driveId,
    staleTime: 1000 * 60 * 10,
  });
};
