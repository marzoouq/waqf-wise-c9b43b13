import { useQuery } from "@tanstack/react-query";
import { useFiscalYears } from "@/hooks/accounting/useFiscalYears";
import { ReportService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface WaqfRevenueData {
  fiscalYearId: string;
  fiscalYearName: string;
  isClosed: boolean;
  isActive: boolean;
  monthlyCollected: number;
  annualCollected: number;
  totalCollected: number;
  totalTax: number;
  netRevenue: number;
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
    queryKey: QUERY_KEYS.WAQF_REVENUE(waqfUnitId, fiscalYearId),
    enabled: !!fiscalYearId && !!selectedYear,
    queryFn: () => ReportService.getWaqfRevenue(fiscalYearId!, selectedYear!, waqfUnitId),
  });

  return {
    revenueData,
    isLoading,
    fiscalYears,
    activeFiscalYear,
    selectedYear,
  };
}
