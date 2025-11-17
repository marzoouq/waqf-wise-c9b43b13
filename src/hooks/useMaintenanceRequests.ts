import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errorHandling";
import type { MaintenanceRequestInsert, MaintenanceRequestUpdate } from "@/types/maintenance";
import { useJournalEntries } from "./useJournalEntries";
import { useTasks } from "@/hooks/useTasks";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

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
    const channel = supabase
      .channel('maintenance-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_requests'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const { data: requests, isLoading } = useQuery({
    queryKey: ["maintenance_requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select(`
          *,
          properties(name, location)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as MaintenanceRequest[];
    },
  });

  const addRequest = useMutation({
    mutationFn: async (request: Omit<MaintenanceRequestInsert, 'request_number'>) => {
      const requestNumber = `MR-${Date.now().toString().slice(-8)}`;
      const { data, error } = await supabase
        .from("maintenance_requests")
        .insert([{ ...request, request_number: requestNumber }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
      
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
      const { data: oldData } = await supabase
        .from("maintenance_requests")
        .select("actual_cost, status, completed_date")
        .eq("id", id)
        .single();

      const { data, error } = await supabase
        .from("maintenance_requests")
        .update(request)
        .eq("id", id)
        .select(`
          *,
          properties(name, location)
        `)
        .single();

      if (error) throw error;

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
      queryClient.invalidateQueries({ queryKey: ["maintenance_requests"] });
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
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

  return {
    requests,
    isLoading,
    addRequest,
    updateRequest,
  };
};