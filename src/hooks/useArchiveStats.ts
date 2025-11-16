import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_KEYS, QUERY_STALE_TIME } from "@/lib/constants";

interface ArchiveStats {
  totalDocuments: number;
  totalFolders: number;
  totalSize: string;
  thisMonthAdditions: number;
}

export function useArchiveStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.DOCUMENTS, "stats"],
    queryFn: async () => {
      // Fetch total documents count
      const { count: documentsCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true });

      // Fetch total folders count
      const { count: foldersCount } = await supabase
        .from("folders")
        .select("*", { count: "exact", head: true });

      // Fetch documents for size calculation and this month count
      const { data: documents } = await supabase
        .from("documents")
        .select("file_size_bytes, created_at");

      // Calculate total size from file_size_bytes
      const totalBytes = documents?.reduce((sum: number, doc: { file_size_bytes?: number }) =>
        sum + (doc.file_size_bytes || 0), 0) || 0;

      // Convert bytes to human-readable format
      const formatBytes = (bytes: number): string => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${Math.round((bytes / Math.pow(k, i)) * 10) / 10} ${sizes[i]}`;
      };

      // Calculate this month additions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonthDocs = documents?.filter(
        (doc: any) => new Date(doc.created_at) >= startOfMonth
      ).length || 0;

      const stats: ArchiveStats = {
        totalDocuments: documentsCount || 0,
        totalFolders: foldersCount || 0,
        totalSize: formatBytes(totalBytes),
        thisMonthAdditions: thisMonthDocs,
      };

      return stats;
    },
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  return {
    stats: stats || {
      totalDocuments: 0,
      totalFolders: 0,
      totalSize: "0 B",
      thisMonthAdditions: 0,
    },
    isLoading,
  };
}
