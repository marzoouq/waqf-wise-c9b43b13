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
    queryFn: async (): Promise<ArchiveStats> => {
      const [docsRes, foldersRes, docsDataRes] = await Promise.all([
        supabase.from("documents").select("*", { count: "exact", head: true }),
        supabase.from("folders").select("*", { count: "exact", head: true }),
        supabase.from("documents").select("file_size_bytes, created_at"),
      ]);

      const totalBytes = docsDataRes.data?.reduce((s, d) => s + (d.file_size_bytes || 0), 0) || 0;
      const formatBytes = (b: number) => b === 0 ? "0 B" : `${(b / Math.pow(1024, Math.floor(Math.log(b) / Math.log(1024)))).toFixed(1)} ${["B","KB","MB","GB"][Math.floor(Math.log(b) / Math.log(1024))]}`;

      const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0,0,0,0);
      const thisMonthDocs = docsDataRes.data?.filter(d => new Date(d.created_at) >= startOfMonth).length || 0;

      return {
        totalDocuments: docsRes.count || 0,
        totalFolders: foldersRes.count || 0,
        totalSize: formatBytes(totalBytes),
        thisMonthAdditions: thisMonthDocs,
      };
    },
    staleTime: QUERY_STALE_TIME.DEFAULT,
  });

  return {
    stats: stats || { totalDocuments: 0, totalFolders: 0, totalSize: "0 B", thisMonthAdditions: 0 },
    isLoading,
  };
}
