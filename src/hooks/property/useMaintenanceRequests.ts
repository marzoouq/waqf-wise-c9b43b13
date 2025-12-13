import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errors";
import type { MaintenanceRequestInsert } from "@/types/maintenance";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { useTasks } from "@/hooks/useTasks";
import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { MaintenanceService, RealtimeService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface MaintenanceRequest {
  id: string;
  request_number: string;
  property_id: string;
  contract_id?: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  requested_by: string;
  requested_date: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  assigned_to?: string;
  vendor_name?: string;
  notes?: string;
  journal_entry_id?: string;
  created_at: string;
  updated_at: string;
  properties?: {
    name: string;
    location: string;
  };
}

export const useMaintenanceRequests = () => {
  const queryClient = useQueryClient();
  const { createAutoEntry } = useJournalEntries();
  const { addTask } = useTasks();

  // Real-time subscription
  useEffect(() => {
    const subscription = RealtimeService.subscribeToTable('maintenance_requests', () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE_REQUESTS_DATA });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: QUERY_KEYS.MAINTENANCE_REQUESTS_DATA,
    queryFn: () => MaintenanceService.getRequestsWithProperties(),
    staleTime: 2 * 60 * 1000,
  });

  const addRequest = useMutation({
    mutationFn: (request: Omit<MaintenanceRequestInsert, 'request_number'>) =>
      MaintenanceService.createRequestWithNumber(request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE_REQUESTS_DATA });
      
      // إنشاء مهمة إذا كانت مجدولة
      if (data.scheduled_date) {
        addTask({
          task: `صيانة مجدولة - ${data.title}`,
          priority: data.priority === 'عاجلة' ? 'عالية' : 'متوسطة',
          status: 'pending',
        }).catch((error) => {
          logger.error(error, { context: 'maintenance_task', severity: 'low' });
        });
      }
      
      toast({
        title: "تم إضافة الطلب",
        description: "تم إضافة طلب الصيانة بنجاح",
      });
    },
    onError: createMutationErrorHandler({ context: 'add_maintenance_request' }),
  });

  const updateRequest = useMutation({
    mutationFn: async ({ id, ...request }: Partial<MaintenanceRequest> & { id: string }) => {
      // جلب البيانات القديمة
      const oldRequests = await MaintenanceService.getRequests();
      const oldData = oldRequests.find(r => r.id === id);

      const data = await MaintenanceService.updateRequestWithProperties(id, request);

      // إنشاء قيد محاسبي عند تسجيل التكلفة الفعلية والإكتمال
      const hasNewCost = data && data.actual_cost && (!oldData || oldData.actual_cost !== data.actual_cost);
      const isCompleted = data.status === "مكتمل";
      const completedDate = data.completed_date || new Date().toISOString().split('T')[0];

      if (hasNewCost && isCompleted) {
        try {
          await createAutoEntry(
            "maintenance_expense",
            data.id,
            data.actual_cost,
            `مصروف صيانة - ${data.request_number} - ${data.title}`,
            completedDate
          );
        } catch (journalError) {
          logger.error(journalError, { context: 'maintenance_journal_entry', severity: 'medium' });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE_REQUESTS_DATA });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.JOURNAL_ENTRIES });
      toast({
        title: "تم تحديث الطلب",
        description: "تم تحديث طلب الصيانة والقيد المحاسبي",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الطلب",
        variant: "destructive",
      });
      logger.error(error, { context: 'update_maintenance_request', severity: 'medium' });
    },
  });

  const deleteRequest = useMutation({
    mutationFn: (id: string) => MaintenanceService.deleteRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MAINTENANCE_REQUESTS_DATA });
      toast({
        title: "تم الحذف",
        description: "تم حذف طلب الصيانة بنجاح",
      });
    },
    onError: (error) => {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الطلب",
        variant: "destructive",
      });
      logger.error(error, { context: 'delete_maintenance_request', severity: 'medium' });
    },
  });

  return {
    requests: requests as MaintenanceRequest[],
    isLoading,
    addRequest,
    updateRequest,
    deleteRequest,
  };
};
