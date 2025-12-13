/**
 * System Errors Hook
 * @version 2.8.44
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SystemService } from "@/services";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useSystemErrors(severityFilter: string, statusFilter: string) {
  return useQuery({
    queryKey: QUERY_KEYS.SYSTEM_ERRORS(severityFilter, statusFilter),
    queryFn: () => SystemService.getSystemErrors(severityFilter, statusFilter),
  });
}

export function useDeleteResolvedErrors() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => SystemService.deleteResolvedErrors(),
    onSuccess: () => {
      toast.success("تم حذف الأخطاء المحلولة");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_ERRORS() });
    },
    onError: () => {
      toast.error("فشل حذف الأخطاء");
    }
  });
}

export function useUpdateErrorStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      SystemService.updateErrorStatus(id, status),
    onSuccess: () => {
      toast.success("تم تحديث الحالة");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_ERRORS() });
    },
    onError: () => {
      toast.error("فشل تحديث الحالة");
    }
  });
}

export function useDeleteAllErrors() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => SystemService.deleteAllErrors(),
    onSuccess: () => {
      toast.success("تم حذف جميع الأخطاء");
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SYSTEM_ERRORS() });
    },
    onError: () => {
      toast.error("فشل حذف الأخطاء");
    }
  });
}
