/**
 * usePublishFiscalYear Hook
 * نشر السنة المالية
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EdgeFunctionService } from "@/services";
import { toast } from "sonner";

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
      queryClient.invalidateQueries({ queryKey: ["fiscal-years"] });
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
