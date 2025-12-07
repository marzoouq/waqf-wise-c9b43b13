/**
 * Hook لبيانات لوحة تحكم الأرشيفي
 * Archivist Dashboard Data Hook
 * نُقل من src/hooks/useArchivistDashboard.ts
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];

      const [foldersRes, documentsRes, allDocsRes] = await Promise.all([
        supabase.from('folders').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('*', { count: 'exact', head: true }),
        supabase.from('documents').select('uploaded_at, file_size')
      ]);

      const todayUploads = allDocsRes.data?.filter((doc) => 
        doc.uploaded_at?.startsWith(today)
      ).length || 0;

      // حساب المساحة من file_size (نص مثل "1.5 MB")
      let totalMB = 0;
      allDocsRes.data?.forEach((doc) => {
        if (doc.file_size) {
          const match = doc.file_size.match(/(\d+\.?\d*)/);
          if (match) {
            totalMB += parseFloat(match[1]);
          }
        }
      });

      return {
        totalFolders: foldersRes.count || 0,
        totalDocuments: documentsRes.count || 0,
        todayUploads,
        totalSize: `${totalMB.toFixed(1)} MB`
      };
    },
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
    queryFn: async () => {
      let query = supabase
        .from('documents')
        .select('id, name, category, uploaded_at, file_size, folders(name)')
        .order('uploaded_at', { ascending: false })
        .limit(10);

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as RecentDocument[];
    },
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
