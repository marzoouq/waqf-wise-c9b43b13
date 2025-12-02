/**
 * Hook لإدارة عمليات إقفال السنوات المالية
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { FiscalYearClosing, FiscalYearSummary } from "@/types/fiscal-year-closing";

export function useFiscalYearClosings() {
  const queryClient = useQueryClient();

  // استرجاع جميع عمليات الإقفال
  const { data: closings, isLoading } = useQuery({
    queryKey: ["fiscal-year-closings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fiscal_year_closings")
        .select(`
          *,
          fiscal_years (
            id,
            name,
            start_date,
            end_date,
            is_active,
            is_closed
          )
        `)
        .order("closing_date", { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as FiscalYearClosing[];
    },
  });

  // استرجاع عملية إقفال محددة
  const getClosingByFiscalYear = async (fiscalYearId: string) => {
    const { data, error } = await supabase
      .from("fiscal_year_closings")
      .select("*")
      .eq("fiscal_year_id", fiscalYearId)
      .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as unknown as FiscalYearClosing | null;
  };

  // حساب ملخص السنة المالية
  const calculateSummary = async (fiscalYearId: string): Promise<FiscalYearSummary> => {
    const { data, error } = await supabase
      .rpc("calculate_fiscal_year_summary", {
        p_fiscal_year_id: fiscalYearId,
      });

      if (error) throw error;
      return data as unknown as FiscalYearSummary;
  };

  // إنشاء عملية إقفال جديدة
  const createClosing = useMutation({
    mutationFn: async (closing: any) => {
      const { data, error } = await supabase
        .from("fiscal_year_closings")
        .insert(closing as any)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-year-closings"] });
      queryClient.invalidateQueries({ queryKey: ["fiscal_years"] });
      toast.success("تم إنشاء عملية الإقفال بنجاح");
    },
    onError: (error: Error) => {
      toast.error("فشل إنشاء عملية الإقفال: " + error.message);
    },
  });

  // تحديث عملية إقفال
  const updateClosing = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { data, error } = await supabase
        .from("fiscal_year_closings")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fiscal-year-closings"] });
      toast.success("تم تحديث عملية الإقفال بنجاح");
    },
    onError: (error: Error) => {
      toast.error("فشل تحديث عملية الإقفال: " + error.message);
    },
  });

  return {
    closings,
    isLoading,
    getClosingByFiscalYear,
    calculateSummary,
    createClosing,
    updateClosing,
  };
}
