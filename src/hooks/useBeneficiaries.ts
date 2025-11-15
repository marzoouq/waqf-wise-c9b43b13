import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedErrorHandler } from "@/hooks/useUnifiedErrorHandler";
import { executeMutation } from "@/lib/mutationHelpers";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { Beneficiary } from "@/types/beneficiary";

export function useBeneficiaries() {
  const { handleError, showSuccess } = useUnifiedErrorHandler();
  const queryClient = useQueryClient();
  const { addActivity } = useActivities();
  const { user } = useAuth();

  // Paginated query with count
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
    staleTime: 3 * 60 * 1000,
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      
      // إضافة نشاط
      try {
        await addActivity({
          action: `تم إضافة مستفيد جديد: ${data.full_name}`,
          user_name: user?.email || 'النظام',
        });
      } catch (error) {
        // تسجيل فقط دون إيقاف العملية
        console.error("Error adding activity:", error);
      }
      
      showSuccess("تمت الإضافة بنجاح", "تم إضافة المستفيد الجديد بنجاح");
    },
    onError: (error: any) => {
      handleError(error, { operation: 'add_beneficiary', component: 'Beneficiaries' });
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      
      // إضافة نشاط
      try {
        await addActivity({
          action: `تم تحديث بيانات المستفيد: ${data.full_name}`,
          user_name: user?.email || 'النظام',
        });
      } catch (error) {
        console.error("Error adding activity:", error);
      }
      
      showSuccess("تم التحديث بنجاح", "تم تحديث بيانات المستفيد بنجاح");
    },
    onError: (error: any) => {
      handleError(error, { operation: 'update_beneficiary', component: 'Beneficiaries' });
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
    onError: (error: any) => {
      handleError(error, { operation: 'delete_beneficiary', component: 'Beneficiaries' });
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
