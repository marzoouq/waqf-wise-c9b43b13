/**
 * usePublishFiscalYear Hook
 * نشر السنة المالية
 * @version 2.9.2
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EdgeFunctionService } from "@/services";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/query-keys";

interface PublishParams {
  fiscalYearId: string;
  notifyHeirs: boolean;
  fiscalYearName?: string;
}

export function usePublishFiscalYear(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const publishMutation = useMutation({
    mutationFn: async ({ fiscalYearId, notifyHeirs }: PublishParams) => {
      const result = await EdgeFunctionService.invokePublishFiscalYear({
        fiscalYearId,
        notifyHeirs,
      });

      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (_, variables) => {
      toast.success("تم نشر السنة المالية بنجاح", {
        description: variables.fiscalYearName 
          ? `أصبحت بيانات ${variables.fiscalYearName} متاحة للورثة`
          : "أصبحت البيانات متاحة للورثة",
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.FISCAL_YEARS });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error("خطأ في النشر", { description: error.message });
    },
  });

  return {
    publish: publishMutation.mutate,
    isPublishing: publishMutation.isPending,
    error: publishMutation.error,
  };
}
