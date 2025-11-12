import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Beneficiary {
  id: string;
  full_name: string;
  national_id: string;
  phone: string;
  email?: string;
  category: string;
  family_name?: string;
  relationship?: string;
  status: string;
  notes?: string;
  tribe?: string;
  priority_level?: number;
  marital_status?: string;
  nationality?: string;
  city?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  bank_name?: string;
  bank_account_number?: string;
  iban?: string;
  monthly_income?: number;
  family_size?: number;
  is_head_of_family?: boolean;
  parent_beneficiary_id?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export function useBeneficiaries() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Paginated query with count
  const { data: beneficiariesData, isLoading } = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from("beneficiaries")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return { beneficiaries: data as Beneficiary[], totalCount: count || 0 };
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
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
