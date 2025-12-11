/**
 * useDistributeRevenue Hook
 * إدارة حالة ومنطق توزيع الغلة
 * @version 2.8.86
 */

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";
import { useFiscalYearsList } from "@/hooks/fiscal-years";
import { DistributionService, BeneficiaryService } from "@/services";
import { EdgeFunctionService } from "@/services/edge-function.service";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface HeirShare {
  beneficiary_id: string;
  heir_type: string;
  share_amount: number;
  share_percentage: number;
  beneficiary_name?: string;
}

export function useDistributeRevenue(onClose: () => void) {
  const queryClient = useQueryClient();
  
  // Form State
  const [totalAmount, setTotalAmount] = useState<string>("");
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<string>("");
  const [distributionDate, setDistributionDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  );
  const [notes, setNotes] = useState<string>("");
  const [notifyHeirs, setNotifyHeirs] = useState(true);
  const [previewShares, setPreviewShares] = useState<HeirShare[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // السنوات المالية النشطة
  const { fiscalYears } = useFiscalYearsList();
  const activeFiscalYears = fiscalYears.filter(fy => fy.is_active);

  // جلب المستفيدين
  const { data: beneficiaries = [] } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARIES_ACTIVE,
    queryFn: async () => {
      const { data } = await BeneficiaryService.getAll({ status: "نشط" });
      return data.filter(b => ["زوجة", "ابن", "بنت"].includes(b.relationship || ""));
    },
  });

  // حساب المعاينة
  const calculatePreview = async () => {
    const amount = parseFloat(totalAmount);
    if (!amount || amount <= 0) {
      toast.error("يرجى إدخال مبلغ صحيح");
      return;
    }

    try {
      const result = await DistributionService.calculateShariahDistribution(amount);

      const sharesWithNames = result.map((share: HeirShare) => ({
        ...share,
        beneficiary_name:
          beneficiaries.find((b) => b.id === share.beneficiary_id)?.full_name ||
          "غير معروف",
      }));

      setPreviewShares(sharesWithNames);
      setIsPreviewMode(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "خطأ غير معروف";
      toast.error("خطأ في حساب التوزيع: " + errorMessage);
    }
  };

  // تنفيذ التوزيع
  const distributeMutation = useMutation({
    mutationFn: async () => {
      const response = await EdgeFunctionService.distributeRevenue({
        totalAmount: parseFloat(totalAmount),
        fiscalYearId: selectedFiscalYear,
        distributionDate,
        notes,
        notifyHeirs,
      });

      if (!response.success) throw new Error(response.error || 'فشل التوزيع');
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("تم توزيع الغلة بنجاح", {
        description: `تم توزيع ${parseFloat(totalAmount).toLocaleString("ar-SA")} ر.س على ${data?.summary?.heirsCount || 0} وريث`,
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HEIR_DISTRIBUTIONS });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARIES });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PAYMENTS });
      resetForm();
      onClose();
    },
    onError: (error: Error) => {
      toast.error("خطأ في التوزيع", { description: error.message });
    },
  });

  // إعادة تعيين النموذج
  const resetForm = () => {
    setTotalAmount("");
    setSelectedFiscalYear("");
    setDistributionDate(format(new Date(), "yyyy-MM-dd"));
    setNotes("");
    setNotifyHeirs(true);
    setPreviewShares([]);
    setIsPreviewMode(false);
  };

  return {
    // Form State
    totalAmount,
    setTotalAmount,
    selectedFiscalYear,
    setSelectedFiscalYear,
    distributionDate,
    setDistributionDate,
    notes,
    setNotes,
    notifyHeirs,
    setNotifyHeirs,
    previewShares,
    isPreviewMode,
    setIsPreviewMode,
    
    // Data
    activeFiscalYears,
    
    // Actions
    calculatePreview,
    executeDistribution: () => distributeMutation.mutate(),
    isExecuting: distributeMutation.isPending,
    resetForm,
  };
}
