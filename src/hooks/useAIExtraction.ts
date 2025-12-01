import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type ExtractionType = 'contract' | 'property';

export const useAIExtraction = () => {
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const extractData = async (text: string, type: ExtractionType = 'contract') => {
    setIsExtracting(true);
    try {
      const { data, error } = await supabase.functions.invoke('extract-contract-data', {
        body: { text, extractionType: type }
      });

      if (error) {
        console.error('خطأ في استدعاء الدالة:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'فشل في استخراج البيانات');
      }

      toast({
        title: "تم الاستخراج بنجاح",
        description: `تم استخراج بيانات ${type === 'contract' ? 'العقد' : 'العقار'} بنجاح`,
      });

      return data.data;
    } catch (error: any) {
      console.error('خطأ في الاستخراج:', error);
      
      let errorMessage = 'فشل في استخراج البيانات';
      if (error.message?.includes('429')) {
        errorMessage = 'تم تجاوز حد الاستخدام. يرجى المحاولة لاحقاً.';
      } else if (error.message?.includes('402')) {
        errorMessage = 'يرجى إضافة رصيد لحساب الذكاء الاصطناعي.';
      }
      
      toast({
        title: "خطأ في الاستخراج",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsExtracting(false);
    }
  };

  return {
    extractData,
    isExtracting,
  };
};
