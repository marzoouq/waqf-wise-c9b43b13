/**
 * Hook لبيانات لوحة تحكم الأرشيفي
 * Archivist Dashboard Data Hook - يستخدم Service Layer
 */

import { useQuery } from "@tanstack/react-query";
import { ArchiveService } from "@/services";

export interface ArchivistStats {
  totalFolders: number;
  totalDocuments: number;
  todayUploads: number;
  totalSize: string;
}

export interface RecentDocument {
  id: string;
  name: string;
  category: string;
  uploaded_at: string;
  file_size: string;
  folders: {
    name: string;
  } | null;
}

/**
 * جلب إحصائيات الأرشيف
 */
export function useArchivistStats() {
  return useQuery<ArchivistStats>({
    queryKey: ["archivist-stats"],
    queryFn: () => ArchiveService.getArchivistStats(),
    staleTime: 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * جلب المستندات الأخيرة مع الفلاتر
 */
export function useRecentDocuments(category: string, searchTerm: string) {
  return useQuery<RecentDocument[]>({
    queryKey: ["recent-documents", category, searchTerm],
    queryFn: () => ArchiveService.getRecentDocuments(category, searchTerm),
    staleTime: 60 * 1000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook موحد للوحة تحكم الأرشيفي
 */
export function useArchivistDashboard(category: string = 'all', searchTerm: string = '') {
  const statsQuery = useArchivistStats();
  const documentsQuery = useRecentDocuments(category, searchTerm);

  return {
    stats: statsQuery.data,
    statsLoading: statsQuery.isLoading,
    statsError: statsQuery.error,
    recentDocuments: documentsQuery.data || [],
    docsLoading: documentsQuery.isLoading,
    docsError: documentsQuery.error,
    refetch: () => {
      statsQuery.refetch();
      documentsQuery.refetch();
    }
  };
}
