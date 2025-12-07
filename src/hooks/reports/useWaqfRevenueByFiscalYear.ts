import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFiscalYears } from "@/hooks/accounting/useFiscalYears";

export interface WaqfRevenueData {
  fiscalYearId: string;
  fiscalYearName: string;
  isClosed: boolean;
  isActive: boolean;
  // الإيرادات
  monthlyCollected: number;  // من عقود شهرية
  annualCollected: number;   // من عقود سنوية
  totalCollected: number;    // إجمالي المحصّل
  totalTax: number;          // الضريبة
  netRevenue: number;        // صافي الإيراد
  // للسنوات المغلقة
  totalExpenses?: number;
  netIncome?: number;
  nazerShare?: number;
  waqfCorpus?: number;
}

export function useWaqfRevenueByFiscalYear(waqfUnitId?: string, fiscalYearId?: string) {
  const { fiscalYears } = useFiscalYears();
  
  const selectedYear = fiscalYears.find(fy => fy.id === fiscalYearId);
  const activeFiscalYear = fiscalYears.find(fy => fy.is_active);

  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['waqf_revenue', waqfUnitId, fiscalYearId],
    enabled: !!fiscalYearId,
    queryFn: async (): Promise<WaqfRevenueData | null> => {
      if (!fiscalYearId || !selectedYear) return null;

      // للسنوات المغلقة: جلب من fiscal_year_closings
      if (selectedYear.is_closed) {
        const { data: closing } = await supabase
          .from('fiscal_year_closings')
          .select('*')
          .eq('fiscal_year_id', fiscalYearId)
          .single();

        if (closing) {
          return {
            fiscalYearId,
            fiscalYearName: selectedYear.name,
            isClosed: true,
            isActive: false,
            monthlyCollected: 0, // السنوات المغلقة لا تفرق
            annualCollected: closing.total_revenues || 0,
            totalCollected: closing.total_revenues || 0,
            totalTax: closing.net_vat || 0,
            netRevenue: closing.net_income || 0,
            totalExpenses: closing.total_expenses || 0,
            netIncome: closing.net_income || 0,
            nazerShare: closing.nazer_share || 0,
            waqfCorpus: closing.waqf_corpus || 0,
          };
        }
      }

      // للسنة النشطة: حساب من rental_payments
      const { data: payments } = await supabase
        .from('rental_payments')
        .select(`
          amount_due,
          tax_amount,
          status,
          payment_date,
          contracts!inner(
            payment_frequency,
            properties!inner(
              waqf_unit_id
            )
          )
        `)
        .eq('status', 'مدفوع')
        .gte('payment_date', selectedYear.start_date)
        .lte('payment_date', selectedYear.end_date);

      let monthlyCollected = 0;
      let annualCollected = 0;
      let totalTax = 0;

      interface PaymentContract {
        payment_frequency: string;
        properties: {
          waqf_unit_id: string | null;
        };
      }

      interface PaymentData {
        amount_due: number | null;
        tax_amount: number | null;
        status: string;
        payment_date: string | null;
        contracts: PaymentContract;
      }

      // تصفية حسب waqf_unit_id إذا تم تحديده
      const filteredPayments = (payments || []).filter((p: PaymentData) => {
        if (!waqfUnitId) return true;
        return p.contracts?.properties?.waqf_unit_id === waqfUnitId;
      });

      filteredPayments.forEach((payment: PaymentData) => {
        const amount = payment.amount_due || 0;
        const tax = payment.tax_amount || 0;
        
        if (payment.contracts?.payment_frequency === 'شهري') {
          monthlyCollected += amount;
        } else {
          annualCollected += amount;
        }
        totalTax += tax;
      });

      const totalCollected = monthlyCollected + annualCollected;
      const netRevenue = totalCollected - totalTax;

      return {
        fiscalYearId,
        fiscalYearName: selectedYear.name,
        isClosed: false,
        isActive: selectedYear.is_active,
        monthlyCollected,
        annualCollected,
        totalCollected,
        totalTax,
        netRevenue,
      };
    },
  });

  return {
    revenueData,
    isLoading,
    fiscalYears,
    activeFiscalYear,
    selectedYear,
  };
}
