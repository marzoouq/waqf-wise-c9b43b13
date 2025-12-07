/**
 * useDistributeRevenue Hook
 * إدارة حالة ومنطق توزيع الغلة
 */

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { useFiscalYearsList } from "@/hooks/fiscal-years";

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
    queryKey: ["beneficiaries-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiaries")
        .select("id, full_name, relationship")
        .eq("status", "نشط")
        .in("relationship", ["زوجة", "ابن", "بنت"]);
      if (error) throw error;
      return data || [];
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
      const { data, error } = await supabase.rpc("calculate_shariah_distribution", {
        p_total_amount: amount,
      });

      if (error) throw error;

      const sharesWithNames = data.map((share: HeirShare) => ({
        ...share,
        beneficiary_name:
          beneficiaries.find((b) => b.id === share.beneficiary_id)?.full_name ||
          "غير معروف",
      }));

      setPreviewShares(sharesWithNames);
      setIsPreviewMode(true);
    } catch (error: any) {
      toast.error("خطأ في حساب التوزيع: " + error.message);
    }
  };

  // تنفيذ التوزيع
  const distributeMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke("distribute-revenue", {
        body: {
          totalAmount: parseFloat(totalAmount),
          fiscalYearId: selectedFiscalYear,
          distributionDate,
          notes,
          notifyHeirs,
        },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("تم توزيع الغلة بنجاح", {
        description: `تم توزيع ${parseFloat(totalAmount).toLocaleString("ar-SA")} ر.س على ${data.summary.heirsCount} وريث`,
      });
      queryClient.invalidateQueries({ queryKey: ["heir-distributions"] });
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      resetForm();
      onClose();
    },
    onError: (error: any) => {
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
