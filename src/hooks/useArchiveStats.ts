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
        .select("file_size, created_at");

      // Calculate total size (convert from string to bytes and sum)
      let totalBytes = 0;
      if (documents) {
        documents.forEach((doc) => {
          const size = doc.file_size;
          // Parse size string (e.g., "2.4 MB", "856 KB")
          const match = size.match(/^([\d.]+)\s*(KB|MB|GB)$/i);
          if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2].toUpperCase();
            if (unit === "KB") totalBytes += value * 1024;
            else if (unit === "MB") totalBytes += value * 1024 * 1024;
            else if (unit === "GB") totalBytes += value * 1024 * 1024 * 1024;
          }
        });
      }

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
        (doc) => new Date(doc.created_at) >= startOfMonth
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
