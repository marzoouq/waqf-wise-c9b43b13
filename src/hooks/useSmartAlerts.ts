import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface SmartAlert {
  id: string;
  alert_type: 'prediction' | 'anomaly' | 'recommendation';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  data: any;
  action_url?: string;
  is_read: boolean;
  is_dismissed: boolean;
  triggered_at: string;
  expires_at?: string;
}

export function useSmartAlerts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // جلب التنبيهات الذكية
  const { data: alerts, isLoading } = useQuery({
    queryKey: ['smart-alerts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('smart_alerts')
        .select('*')
        .eq('is_dismissed', false)
        .order('triggered_at', { ascending: false });

      if (error) throw error;
      return data as SmartAlert[];
    },
    refetchInterval: 60000, // تحديث كل دقيقة
  });

  // توليد رؤى ذكية
  const generateInsights = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('generate_smart_insights');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-alerts'] });
      toast({
        title: 'تم التحديث',
        description: 'تم تحديث التنبيهات الذكية',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ في التحديث',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // وضع علامة مقروء
  const markAsRead = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ is_read: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-alerts'] });
    },
  });

  // رفض التنبيه
  const dismissAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from('smart_alerts')
        .update({ is_dismissed: true })
        .eq('id', alertId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['smart-alerts'] });
    },
  });

  // إحصائيات التنبيهات
  const alertsStats = {
    total: alerts?.length || 0,
    unread: alerts?.filter(a => !a.is_read).length || 0,
    critical: alerts?.filter(a => a.severity === 'critical').length || 0,
    warnings: alerts?.filter(a => a.severity === 'warning').length || 0,
    byType: {
      predictions: alerts?.filter(a => a.alert_type === 'prediction').length || 0,
      anomalies: alerts?.filter(a => a.alert_type === 'anomaly').length || 0,
      recommendations: alerts?.filter(a => a.alert_type === 'recommendation').length || 0,
    },
  };

  return {
    alerts,
    isLoading,
    alertsStats,
    generateInsights: generateInsights.mutateAsync,
    markAsRead: markAsRead.mutateAsync,
    dismissAlert: dismissAlert.mutateAsync,
    isGenerating: generateInsights.isPending,
  };
}