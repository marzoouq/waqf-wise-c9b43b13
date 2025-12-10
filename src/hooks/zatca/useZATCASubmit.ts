/**
 * Hook لإرسال الفواتير لهيئة الزكاة والضريبة
 * @version 2.8.67
 */

import { useState } from "react";
import { EdgeFunctionService } from "@/services";
import { toast } from "sonner";

type ZATCAStatus = 'pending' | 'success' | 'error';

export function useZATCASubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zatcaStatus, setZatcaStatus] = useState<ZATCAStatus>('pending');

  const submitToZATCA = async (invoiceId: string) => {
    setIsSubmitting(true);
    try {
      const result = await EdgeFunctionService.invoke<{ success: boolean; submissionId?: string; error?: string }>('zatca-submit', {
        invoiceId,
      });

      if (!result.success) throw new Error(result.error);

      if (result.data?.success) {
        setZatcaStatus('success');
        toast.success("تم إرسال الفاتورة إلى هيئة الزكاة والضريبة", {
          description: `رقم الإرسال: ${result.data.submissionId}`,
        });
        return true;
      } else {
        setZatcaStatus('error');
        toast.error("فشل إرسال الفاتورة", {
          description: result.data?.error || "حدث خطأ غير متوقع",
        });
        return false;
      }
    } catch (error) {
      setZatcaStatus('error');
      toast.error("خطأ في الاتصال", {
        description: "تعذر الاتصال بخدمة هيئة الزكاة والضريبة",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    zatcaStatus,
    submitToZATCA,
  };
}
