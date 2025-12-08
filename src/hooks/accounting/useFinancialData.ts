import { useQuery } from "@tanstack/react-query";
import { AccountingService } from "@/services/accounting.service";
import { QUERY_CONFIG } from "@/lib/queryOptimization";

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
    queryKey: ["financial-data"],
    queryFn: () => AccountingService.getFinancialData(),
    ...QUERY_CONFIG.CHARTS,
  });
}
