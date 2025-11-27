/**
 * Hook لإدارة لوحات التحكم والـ Widgets
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Dashboard, DashboardWidget, WidgetConfig } from '@/types/reports/advanced';

interface DashboardRow {
  id: string;
  dashboard_name: string;
  dashboard_name_ar: string | null;
  description: string | null;
  layout_config: Record<string, unknown> | null;
  is_default: boolean | null;
  is_system: boolean | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface WidgetRow {
  id: string;
  dashboard_id: string | null;
  widget_name: string;
  widget_name_ar: string | null;
  widget_type: string;
  data_source: string | null;
  config: Record<string, unknown> | null;
  position_x: number | null;
  position_y: number | null;
  width: number | null;
  height: number | null;
  is_visible: boolean | null;
  refresh_interval: number | null;
  created_at: string;
  updated_at: string;
}

export function useDashboards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب لوحات التحكم
  const { data: dashboards, isLoading: isLoadingDashboards } = useQuery({
    queryKey: ['dashboards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .order('is_default', { ascending: false });

      if (error) throw error;
      
      return (data as DashboardRow[]).map(d => ({
        ...d,
        layout_config: d.layout_config || {},
        is_default: d.is_default ?? false,
        is_system: d.is_system ?? false,
      })) as Dashboard[];
    },
  });

  // جلب widgets لوحة تحكم معينة
  const useWidgets = (dashboardId: string | null) => {
    return useQuery({
      queryKey: ['dashboard-widgets', dashboardId],
      queryFn: async () => {
        if (!dashboardId) return [];

        const { data, error } = await supabase
          .from('dashboard_widgets')
          .select('*')
          .eq('dashboard_id', dashboardId)
          .eq('is_visible', true)
          .order('position_y', { ascending: true })
          .order('position_x', { ascending: true });

        if (error) throw error;
        
        return (data as WidgetRow[]).map(w => ({
          ...w,
          widget_type: w.widget_type as DashboardWidget['widget_type'],
          config: (w.config || {}) as WidgetConfig,
          position_x: w.position_x ?? 0,
          position_y: w.position_y ?? 0,
          width: w.width ?? 4,
          height: w.height ?? 3,
          is_visible: w.is_visible ?? true,
        })) as DashboardWidget[];
      },
      enabled: !!dashboardId,
    });
  };

  // إنشاء لوحة تحكم
  const createDashboard = useMutation({
    mutationFn: async (dashboard: Partial<Dashboard>) => {
      const { data, error } = await supabase
        .from('dashboards')
        .insert([{
          dashboard_name: dashboard.dashboard_name || 'لوحة جديدة',
          dashboard_name_ar: dashboard.dashboard_name_ar,
          description: dashboard.description,
          layout_config: JSON.parse(JSON.stringify(dashboard.layout_config || {})),
          is_default: false,
          is_system: false,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إنشاء لوحة التحكم',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: `فشل في إنشاء لوحة التحكم: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // إضافة widget
  const addWidget = useMutation({
    mutationFn: async (widget: Partial<DashboardWidget>) => {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .insert([{
          dashboard_id: widget.dashboard_id,
          widget_name: widget.widget_name || 'Widget جديد',
          widget_name_ar: widget.widget_name_ar,
          widget_type: widget.widget_type || 'stat',
          data_source: widget.data_source,
          config: JSON.parse(JSON.stringify(widget.config || {})),
          position_x: widget.position_x || 0,
          position_y: widget.position_y || 0,
          width: widget.width || 4,
          height: widget.height || 3,
          is_visible: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets', variables.dashboard_id] });
      toast({
        title: 'تم بنجاح',
        description: 'تم إضافة العنصر',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: `فشل في إضافة العنصر: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // تحديث موقع widget
  const updateWidgetPosition = useMutation({
    mutationFn: async ({ 
      widgetId, 
      position 
    }: { 
      widgetId: string; 
      position: { x: number; y: number; width?: number; height?: number } 
    }) => {
      const updateData: Record<string, unknown> = {
        position_x: position.x,
        position_y: position.y,
        updated_at: new Date().toISOString(),
      };
      
      if (position.width !== undefined) updateData.width = position.width;
      if (position.height !== undefined) updateData.height = position.height;

      const { error } = await supabase
        .from('dashboard_widgets')
        .update(updateData)
        .eq('id', widgetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets'] });
    },
  });

  // حذف widget
  const deleteWidget = useMutation({
    mutationFn: async ({ widgetId, dashboardId }: { widgetId: string; dashboardId: string }) => {
      const { error } = await supabase
        .from('dashboard_widgets')
        .delete()
        .eq('id', widgetId);

      if (error) throw error;
      return dashboardId;
    },
    onSuccess: (dashboardId) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-widgets', dashboardId] });
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف العنصر',
      });
    },
    onError: (error) => {
      toast({
        title: 'خطأ',
        description: `فشل في حذف العنصر: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // تعيين لوحة تحكم كافتراضية
  const setDefaultDashboard = useMutation({
    mutationFn: async (dashboardId: string) => {
      // إلغاء الافتراضي من الجميع
      await supabase
        .from('dashboards')
        .update({ is_default: false })
        .neq('id', dashboardId);

      // تعيين الجديد كافتراضي
      const { error } = await supabase
        .from('dashboards')
        .update({ is_default: true })
        .eq('id', dashboardId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboards'] });
      toast({
        title: 'تم بنجاح',
        description: 'تم تعيين لوحة التحكم الافتراضية',
      });
    },
  });

  const defaultDashboard = dashboards?.find(d => d.is_default) || dashboards?.[0];

  return {
    dashboards: dashboards || [],
    defaultDashboard,
    isLoading: isLoadingDashboards,
    useWidgets,
    createDashboard: createDashboard.mutateAsync,
    addWidget: addWidget.mutateAsync,
    updateWidgetPosition: updateWidgetPosition.mutateAsync,
    deleteWidget: deleteWidget.mutateAsync,
    setDefaultDashboard: setDefaultDashboard.mutateAsync,
  };
}
