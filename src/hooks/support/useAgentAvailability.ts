import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupportService } from '@/services/support.service';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/query-keys';

/**
 * Hook لجلب توافر وكيل الدعم
 * @version 2.8.73 - Refactored to use SupportService
 */
export function useAgentAvailability(userId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.AGENT_AVAILABILITY(userId || ''),
    queryFn: async () => {
      if (!userId) return null;
      return SupportService.getAgentAvailability(userId);
    },
    enabled: !!userId,
  });
}

/**
 * Hook لتحديث توافر وكيل الدعم
 */
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isAvailable,
      maxCapacity,
      skills,
    }: {
      userId: string;
      isAvailable?: boolean;
      maxCapacity?: number;
      skills?: string[];
    }) => {
      return SupportService.updateAgentAvailability({
        userId,
        isAvailable,
        maxCapacity,
        skills,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-availability'] });
      toast.success('تم تحديث حالة التوافر');
    },
    onError: (error: Error) => {
      toast.error('فشل التحديث: ' + error.message);
    },
  });
}

/**
 * Hook لجلب إحصائيات وكيل الدعم
 */
export function useAgentStats(userId?: string, dateRange?: { from: string; to: string }) {
  return useQuery({
    queryKey: QUERY_KEYS.AGENT_STATS(userId || '', dateRange),
    queryFn: () => SupportService.getAgentStats(userId, dateRange),
  });
}

/**
 * Hook لجلب التصعيدات
 */
export function useEscalations() {
  return useQuery({
    queryKey: QUERY_KEYS.SUPPORT_ESCALATIONS,
    queryFn: () => SupportService.getEscalations(),
  });
}

/**
 * Hook لإدارة إعدادات التعيين
 */
export function useAssignmentSettings() {
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: QUERY_KEYS.ASSIGNMENT_SETTINGS,
    queryFn: () => SupportService.getAssignmentSettings(),
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: {
      assignment_type?: string;
      auto_assign?: boolean;
      max_tickets_per_agent?: number;
    }) => {
      return SupportService.updateAssignmentSettings(newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSIGNMENT_SETTINGS });
      toast.success('تم تحديث إعدادات التعيين');
    },
    onError: (error: Error) => {
      toast.error('فشل التحديث: ' + error.message);
    },
  });

  return { settings, updateSettings };
}
