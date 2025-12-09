/**
 * Dashboard Config Hook
 * @version 2.8.54
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardService } from '@/services/dashboard.service';
import { QUERY_KEYS } from '@/lib/query-keys';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

export interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface DashboardConfig {
  id: string;
  user_id?: string;
  dashboard_name: string;
  layout_config: {
    widgets: DashboardWidget[];
  };
  is_default: boolean;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export function useDashboardConfigs() {
  return useQuery({
    queryKey: QUERY_KEYS.DASHBOARD_CONFIGS,
    queryFn: async () => {
      const data = await DashboardService.getDashboardConfigs();
      return (data || []).map(item => ({
        ...item,
        layout_config: item.layout_config as unknown as { widgets: DashboardWidget[] }
      }));
    },
  });
}

export function useSaveDashboardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Omit<DashboardConfig, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => 
      DashboardService.saveDashboardConfig({
        ...config,
        layout_config: config.layout_config as unknown as Json
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_CONFIGS });
      toast.success('تم حفظ لوحة التحكم بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل حفظ لوحة التحكم: ' + error.message);
    },
  });
}

export function useUpdateDashboardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, config }: { id: string; config: Partial<DashboardConfig> }) => 
      DashboardService.updateDashboardConfig(id, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_CONFIGS });
      toast.success('تم تحديث لوحة التحكم بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل تحديث لوحة التحكم: ' + error.message);
    },
  });
}

export function useDeleteDashboardConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DashboardService.deleteDashboardConfig(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD_CONFIGS });
      toast.success('تم حذف لوحة التحكم بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل حذف لوحة التحكم: ' + error.message);
    },
  });
}
