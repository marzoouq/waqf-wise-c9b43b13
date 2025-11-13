import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useActivities } from "@/hooks/useActivities";
import { useAuth } from "@/hooks/useAuth";
import { Beneficiary } from "@/types/beneficiary";

export function useBeneficiaries() {
  const { toast } = useToast();
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
      const { data, error } = await supabase
        .from("beneficiaries")
        .insert([beneficiary])
        .select()
        .single();

      if (error) throw error;
      return data;
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
        console.error("Error adding activity:", error);
      }
      
      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة المستفيد الجديد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الإضافة",
        description: error.message || "حدث خطأ أثناء إضافة المستفيد",
        variant: "destructive",
      });
    },
  });

  const updateBeneficiary = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Beneficiary> & { id: string }) => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات المستفيد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث المستفيد",
        variant: "destructive",
      });
    },
  });

  const deleteBeneficiary = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("beneficiaries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف المستفيد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "حدث خطأ أثناء حذف المستفيد",
        variant: "destructive",
      });
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
