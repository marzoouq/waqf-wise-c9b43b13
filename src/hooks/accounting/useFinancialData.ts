import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { QUERY_CONFIG } from "@/infrastructure/react-query";
import { QUERY_KEYS } from "@/lib/query-keys";

export interface FinancialData {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export function useFinancialData() {
  return useQuery({
    queryKey: QUERY_KEYS.FINANCIAL_DATA,
    queryFn: () => AccountingService.getFinancialData(),
    ...QUERY_CONFIG.CHARTS,
  });
}
