/**
 * Hook لإرسال الفواتير لهيئة الزكاة والضريبة
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ZATCAStatus = 'pending' | 'success' | 'error';

export function useZATCASubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [zatcaStatus, setZatcaStatus] = useState<ZATCAStatus>('pending');

  const submitToZATCA = async (invoiceId: string) => {
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('zatca-submit', {
        body: { invoiceId },
      });

      if (error) throw error;

      if (data.success) {
        setZatcaStatus('success');
        toast.success("تم إرسال الفاتورة إلى هيئة الزكاة والضريبة", {
          description: `رقم الإرسال: ${data.submissionId}`,
        });
        return true;
      } else {
        setZatcaStatus('error');
        toast.error("فشل إرسال الفاتورة", {
          description: data.error || "حدث خطأ غير متوقع",
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
