/**
 * useMyBeneficiaryRequests Hook
 * إدارة طلبات المستفيد الخاصة به (من بوابة المستفيد)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BeneficiaryRequest {
  id: string;
  request_number?: string;
  request_type_id?: string;
  description: string;
  amount?: number;
  status: string;
  created_at: string;
  reviewed_at?: string;
  decision_notes?: string;
}

export interface RequestFormData {
  request_type: string;
  amount: string;
  description: string;
}

const initialFormData: RequestFormData = {
  request_type: "فزعة",
  amount: "",
  description: "",
};

export function useMyBeneficiaryRequests(userId?: string) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RequestFormData>(initialFormData);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // جلب معرف المستفيد من user_id
  const { data: beneficiary } = useQuery({
    queryKey: ["my-beneficiary", userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });

  // جلب الطلبات
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["beneficiary-requests", beneficiary?.id],
    queryFn: async () => {
      if (!beneficiary?.id) return [];

      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select(
          "id, request_number, request_type_id, description, amount, status, created_at, reviewed_at, decision_notes"
        )
        .eq("beneficiary_id", beneficiary.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BeneficiaryRequest[];
    },
    enabled: !!beneficiary?.id,
  });

  // إنشاء طلب جديد
  const createRequest = useMutation({
    mutationFn: async (requestData: RequestFormData) => {
      if (!beneficiary?.id) throw new Error("لم يتم العثور على حساب المستفيد");

      // الحصول على نوع طلب افتراضي
      const { data: requestType } = await supabase
        .from("request_types")
        .select("id")
        .limit(1)
        .single();

      const { error } = await supabase.from("beneficiary_requests").insert([
        {
          beneficiary_id: beneficiary.id,
          request_type_id: requestType?.id || null,
          description: requestData.description,
          amount: requestData.amount ? parseFloat(requestData.amount) : null,
          status: "pending",
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["beneficiary-requests"] });
      toast.success("تم تقديم الطلب بنجاح");
      setIsDialogOpen(false);
      setFormData(initialFormData);
    },
    onError: (error: Error) => {
      toast.error(error.message || "فشل تقديم الطلب");
    },
  });

  // حساب الإحصائيات
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  // دوال مساعدة
  const updateFormData = (updates: Partial<RequestFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const submitRequest = () => {
    createRequest.mutate(formData);
  };

  const openDialog = () => setIsDialogOpen(true);
  const closeDialog = () => setIsDialogOpen(false);

  return {
    // البيانات
    beneficiary,
    requests,
    stats,
    isLoading,

    // النموذج
    formData,
    updateFormData,
    isDialogOpen,
    openDialog,
    closeDialog,

    // العمليات
    submitRequest,
    isSubmitting: createRequest.isPending,
  };
}
