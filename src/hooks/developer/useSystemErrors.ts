/**
 * System Errors Hook
 * @version 2.8.39
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useSystemErrors(severityFilter: string, statusFilter: string) {
  return useQuery({
    queryKey: ["system-errors", severityFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("system_error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      
      if (severityFilter !== "all") {
        query = query.eq("severity", severityFilter);
      }
      
      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    }
  });
}

export function useDeleteResolvedErrors() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("system_error_logs")
        .delete()
        .eq("status", "resolved");
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف الأخطاء المحلولة");
      queryClient.invalidateQueries({ queryKey: ["system-errors"] });
    },
    onError: () => {
      toast.error("فشل حذف الأخطاء");
    }
  });
}

export function useUpdateErrorStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("system_error_logs")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تحديث الحالة");
      queryClient.invalidateQueries({ queryKey: ["system-errors"] });
    },
    onError: () => {
      toast.error("فشل تحديث الحالة");
    }
  });
}

export function useDeleteAllErrors() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("system_error_logs")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حذف جميع الأخطاء");
      queryClient.invalidateQueries({ queryKey: ["system-errors"] });
    },
    onError: () => {
      toast.error("فشل حذف الأخطاء");
    }
  });
}
