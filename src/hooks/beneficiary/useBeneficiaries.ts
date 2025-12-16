import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services";
import { handleError, showSuccess } from "@/lib/errors";
import { useActivities } from "@/hooks/ui/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { Beneficiary } from "@/types/beneficiary";
import { logger } from "@/lib/logger";
import { QUERY_KEYS } from "@/lib/query-keys";

export function useBeneficiaries() {
  const queryClient = useQueryClient();
  const { addActivity } = useActivities();
  const { user } = useAuth();

  const { data: beneficiariesData, isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARIES,
    queryFn: async () => {
      const result = await BeneficiaryService.getAll();
      return { beneficiaries: result.data as Beneficiary[], totalCount: result.count };
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const beneficiaries = beneficiariesData?.beneficiaries || [];
  const totalCount = beneficiariesData?.totalCount || 0;

  const addBeneficiary = useMutation({
    mutationFn: async (beneficiary: Omit<Beneficiary, "id" | "created_at" | "updated_at">) => {
      return BeneficiaryService.create(beneficiary);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
      addActivity({
        action: `تم إضافة مستفيد جديد: ${data.full_name}`,
        user_name: user?.email || 'النظام',
      }).catch((error) => {
        logger.error(error, { context: 'add_beneficiary_activity', severity: 'low' });
      });
      showSuccess("تمت الإضافة بنجاح", "تم إضافة المستفيد الجديد بنجاح");
    },
    onError: (error: unknown) => {
      handleError(error, { context: { operation: 'add_beneficiary', component: 'Beneficiaries' } });
    },
  });

  const updateBeneficiary = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Beneficiary> & { id: string }) => {
      return BeneficiaryService.update(id, updates);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
      addActivity({
        action: `تم تحديث بيانات المستفيد: ${data.full_name}`,
        user_name: user?.email || 'النظام',
      }).catch((error) => {
        logger.error(error, { context: 'update_beneficiary_activity', severity: 'low' });
      });
      showSuccess("تم التحديث بنجاح", "تم تحديث بيانات المستفيد بنجاح");
    },
    onError: (error: unknown) => {
      handleError(error, { context: { operation: 'update_beneficiary', component: 'Beneficiaries' } });
    },
  });

  const deleteBeneficiary = useMutation({
    mutationFn: async (id: string) => {
      return BeneficiaryService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
      showSuccess("تم الحذف بنجاح", "تم حذف المستفيد بنجاح");
    },
    onError: (error: unknown) => {
      handleError(error, { context: { operation: 'delete_beneficiary', component: 'Beneficiaries' } });
    },
  });

  return {
    beneficiaries,
    totalCount,
    isLoading,
    error,
    refetch,
    addBeneficiary: addBeneficiary.mutateAsync,
    updateBeneficiary: updateBeneficiary.mutateAsync,
    deleteBeneficiary: deleteBeneficiary.mutateAsync,
  };
}
