/**
 * useMyBeneficiaryRequests Hook
 * إدارة طلبات المستفيد الخاصة به (من بوابة المستفيد)
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequestService, BeneficiaryService } from "@/services";

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
      return BeneficiaryService.getByUserId(userId);
    },
    enabled: !!userId,
  });

  // جلب الطلبات باستخدام الخدمة
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["beneficiary-requests", beneficiary?.id],
    queryFn: async () => {
      if (!beneficiary?.id) return [];
      return RequestService.getAll(beneficiary.id);
    },
    enabled: !!beneficiary?.id,
  });

  // إنشاء طلب جديد باستخدام الخدمة
  const createRequest = useMutation({
    mutationFn: async (requestData: RequestFormData) => {
      if (!beneficiary?.id) throw new Error("لم يتم العثور على حساب المستفيد");

      // الحصول على نوع طلب افتراضي
      const requestTypes = await RequestService.getRequestTypes();
      const defaultType = requestTypes[0];

      const result = await RequestService.create({
        beneficiary_id: beneficiary.id,
        request_type_id: defaultType?.id || "",
        description: requestData.description,
        amount: requestData.amount ? parseFloat(requestData.amount) : undefined,
      });

      if (!result.success) throw new Error(result.message);
      return result;
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
    pending: requests.filter((r: BeneficiaryRequest) => r.status === "pending" || r.status === "قيد المراجعة").length,
    approved: requests.filter((r: BeneficiaryRequest) => r.status === "approved" || r.status === "موافق عليه").length,
    rejected: requests.filter((r: BeneficiaryRequest) => r.status === "rejected" || r.status === "مرفوض").length,
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
