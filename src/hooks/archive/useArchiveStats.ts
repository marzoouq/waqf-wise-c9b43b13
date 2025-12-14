import { useQuery } from "@tanstack/react-query";
import { ArchiveService } from "@/services";
import { QUERY_STALE_TIME } from "@/lib/constants";
import { QUERY_KEYS } from "@/lib/query-keys";

interface ArchiveStats {
  totalDocuments: number;
  totalFolders: number;
  totalSize: string;
  thisMonthAdditions: number;
}

export function useArchiveStats() {
  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: [...QUERY_KEYS.DOCUMENTS, "stats"],
    queryFn: () => ArchiveService.getStats(),
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  return {
    stats: stats || { totalDocuments: 0, totalFolders: 0, totalSize: "0 B", thisMonthAdditions: 0 },
    isLoading,
    error,
    refetch,
  };
}
