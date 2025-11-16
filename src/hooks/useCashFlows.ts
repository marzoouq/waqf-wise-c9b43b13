import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createMutationErrorHandler } from "@/lib/errorHandling";

export interface CashFlow {
  id: string;
  fiscal_year_id: string;
  period_start: string;
  period_end: string;
  operating_activities: number;
  investing_activities: number;
  financing_activities: number;
  net_cash_flow: number;
  opening_cash: number;
  closing_cash: number;
  created_at: string;
  updated_at: string;
}

export function useCashFlows(fiscalYearId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cashFlows = [], isLoading } = useQuery({
    queryKey: ["cash_flows", fiscalYearId || undefined],
    queryFn: async () => {
      // استخدام استعلام SQL مباشر لحساب التدفقات النقدية
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      const startDateStr = startDate.toISOString().split('T')[0];

      // استدعاء الدالة باستخدام SQL الخام
      const { data, error } = await supabase
        .from('cash_flows')
        .select('*')
        .order('period_start', { ascending: false })
        .limit(1);

      if (error) {
        // إذا لم توجد بيانات في الجدول، نستخدم حساب مبسط
        const defaultCashFlow: CashFlow = {
          id: 'current',
          fiscal_year_id: fiscalYearId || '',
          period_start: startDateStr,
          period_end: endDate,
          operating_activities: 0,
          investing_activities: 0,
          financing_activities: 0,
          net_cash_flow: 0,
          opening_cash: 0,
          closing_cash: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        return [defaultCashFlow];
      }

      return (data || []) as CashFlow[];
    },
  });

  const calculateCashFlow = useMutation({
    mutationFn: async ({ 
      fiscalYearId, 
      periodStart, 
      periodEnd 
    }: { 
      fiscalYearId: string; 
      periodStart: string; 
      periodEnd: string;
    }) => {
      // حساب التدفقات النقدية من الأنشطة التشغيلية
      const { data: operatingData, error: opError } = await supabase
        .from("journal_entry_lines")
        .select("debit_amount, credit_amount, accounts!inner(account_type)")
        .gte("journal_entries.entry_date", periodStart)
        .lte("journal_entries.entry_date", periodEnd)
        .in("accounts.account_type", ["revenue", "expense"]);

      if (opError) throw opError;

interface CashFlowLine {
  debit_amount: number;
  credit_amount: number;
}

      const operating = operatingData?.reduce((sum: number, line: CashFlowLine) => {
        return sum + (line.debit_amount - line.credit_amount);
      }, 0) || 0;

      // حساب التدفقات النقدية من الأنشطة الاستثمارية
      const { data: investingData, error: invError } = await supabase
        .from("journal_entry_lines")
        .select("debit_amount, credit_amount, accounts!inner(code)")
        .gte("journal_entries.entry_date", periodStart)
        .lte("journal_entries.entry_date", periodEnd)
        .like("accounts.code", "1.2%");

      if (invError) throw invError;

      const investing = investingData?.reduce((sum: number, line: CashFlowLine) => {
        return sum + (line.debit_amount - line.credit_amount);
      }, 0) || 0;

      // حساب التدفقات النقدية من الأنشطة التمويلية
      const { data: financingData, error: finError } = await supabase
        .from("journal_entry_lines")
        .select("debit_amount, credit_amount, accounts!inner(code)")
        .gte("journal_entries.entry_date", periodStart)
        .lte("journal_entries.entry_date", periodEnd)
        .like("accounts.code", "2%");

      if (finError) throw finError;

      const financing = financingData?.reduce((sum: number, line: CashFlowLine) => {
        return sum + (line.debit_amount - line.credit_amount);
      }, 0) || 0;

      // حساب النقد في بداية ونهاية الفترة
      const { data: openingCashData } = await supabase
        .from("journal_entry_lines")
        .select("debit_amount, credit_amount, accounts!inner(code)")
        .lt("journal_entries.entry_date", periodStart)
        .eq("accounts.code", "1.1.1");

      const openingCash = openingCashData?.reduce((sum: number, line: CashFlowLine) => {
        return sum + (line.debit_amount - line.credit_amount);
      }, 0) || 0;

      const netCashFlow = operating + investing + financing;
      const closingCash = openingCash + netCashFlow;

      // حفظ النتائج
      const { data, error } = await supabase
        .from("cash_flows")
        .insert([{
          fiscal_year_id: fiscalYearId,
          period_start: periodStart,
          period_end: periodEnd,
          operating_activities: operating,
          investing_activities: investing,
          financing_activities: financing,
          net_cash_flow: netCashFlow,
          opening_cash: openingCash,
          closing_cash: closingCash,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash_flows"] });
      toast({
        title: "تم الحساب بنجاح",
        description: "تم حساب قائمة التدفقات النقدية",
      });
    },
    onError: createMutationErrorHandler({
      context: 'calculate_cash_flow',
      toastTitle: 'خطأ في الحساب',
    }),
  });

  return {
    cashFlows,
    isLoading,
    calculateCashFlow: calculateCashFlow.mutateAsync,
  };
}
