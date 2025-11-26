import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { handleError, showSuccess } from "@/lib/errors";
import { executeMutation } from "@/lib/mutationHelpers";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { Beneficiary } from "@/types/beneficiary";
import { logger } from "@/lib/logger";

export function useBeneficiaries() {
  const queryClient = useQueryClient();
  const { addActivity } = useActivities();
  const { user } = useAuth();

  // Paginated query with count - Optimized for list view
  const { data: beneficiariesData, isLoading } = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("beneficiaries")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { beneficiaries: (data || []) as Beneficiary[], totalCount: count || 0 };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - improved caching
    gcTime: 20 * 60 * 1000, // 20 minutes - garbage collection
    refetchOnWindowFocus: false,
  });

  const beneficiaries = beneficiariesData?.beneficiaries || [];
  const totalCount = beneficiariesData?.totalCount || 0;

  const addBeneficiary = useMutation({
    mutationFn: async (beneficiary: Omit<Beneficiary, "id" | "created_at" | "updated_at">) => {
      return executeMutation(
        async () => {
          const { data, error } = await supabase
            .from("beneficiaries")
            .insert([beneficiary])
            .select()
            .maybeSingle();

          if (error) throw error;
          if (!data) throw new Error("فشل في إضافة المستفيد");
          return data;
        },
        'add_beneficiary'
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      
      // إضافة نشاط
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
      return executeMutation(
        async () => {
          const { data, error } = await supabase
            .from("beneficiaries")
            .update(updates)
            .eq("id", id)
            .select()
            .maybeSingle();

          if (error) throw error;
          if (!data) throw new Error("فشل في تحديث بيانات المستفيد");
          return data;
        },
        'update_beneficiary'
      );
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      
      // إضافة نشاط
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
      return executeMutation(
        async () => {
          const { error } = await supabase
            .from("beneficiaries")
            .delete()
            .eq("id", id);

          if (error) throw error;
        },
        'delete_beneficiary'
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
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
    addBeneficiary: addBeneficiary.mutateAsync,
    updateBeneficiary: updateBeneficiary.mutateAsync,
    deleteBeneficiary: deleteBeneficiary.mutateAsync,
  };
}
