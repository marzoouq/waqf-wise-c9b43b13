import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
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
    queryKey: ['dashboard-configs'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('dashboard_configurations')
        .select('*')
        .or(`user_id.eq.${user?.id},is_shared.eq.true`)
        .order('is_default', { ascending: false });

      if (error) throw error;
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
    mutationFn: async (config: Omit<DashboardConfig, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('dashboard_configurations')
        .insert({
          dashboard_name: config.dashboard_name,
          layout_config: config.layout_config as unknown as Json,
          is_default: config.is_default,
          is_shared: config.is_shared,
          user_id: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-configs'] });
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
    mutationFn: async ({ id, config }: { id: string; config: Partial<DashboardConfig> }) => {
      const updateData: Record<string, unknown> = {};
      if (config.dashboard_name) updateData.dashboard_name = config.dashboard_name;
      if (config.layout_config) updateData.layout_config = config.layout_config;
      if (config.is_default !== undefined) updateData.is_default = config.is_default;
      if (config.is_shared !== undefined) updateData.is_shared = config.is_shared;
      
      const { data, error } = await supabase
        .from('dashboard_configurations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-configs'] });
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
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dashboard_configurations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-configs'] });
      toast.success('تم حذف لوحة التحكم بنجاح');
    },
    onError: (error: Error) => {
      toast.error('فشل حذف لوحة التحكم: ' + error.message);
    },
  });
}