/**
 * useFinancialAnalytics Hook
 * @version 2.8.68
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccountingService } from '@/services';
import { useToast } from '@/hooks/use-toast';
import { safeFilter, safeReduce } from '@/lib/utils/array-safe';
import type { Json } from '@/integrations/supabase/types';
import { QUERY_KEYS } from '@/lib/query-keys';

export interface KPIMetadata {
  current_assets?: number;
  current_liabilities?: number;
  total_revenue?: number;
  net_income?: number;
  [key: string]: number | undefined;
}

export interface FinancialKPI {
  id: string;
  kpi_name: string;
  kpi_category: string;
  kpi_value: number;
  kpi_target?: number;
  period_start: string;
  period_end: string;
  fiscal_year_id?: string;
  metadata?: KPIMetadata;
  created_at: string;
}

export interface FinancialForecast {
  id: string;
  forecast_type: string;
  account_id?: string;
  period_start: string;
  period_end: string;
  forecasted_amount: number;
  actual_amount?: number;
  variance?: number;
  confidence_level?: number;
  model_used?: string;
  created_at: string;
}

interface Account {
  id: string;
  code: string;
  account_type: string;
  current_balance: number | null;
}

interface JournalEntryLine {
  debit_amount: number;
  credit_amount: number;
  accounts: { account_type: string } | null;
  journal_entries: { entry_date: string };
}

export function useFinancialAnalytics(fiscalYearId?: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: kpis, isLoading: isLoadingKPIs } = useQuery({
    queryKey: QUERY_KEYS.FINANCIAL_KPIS(fiscalYearId),
    queryFn: () => AccountingService.getFinancialKPIs(fiscalYearId),
  });

  const { data: forecasts, isLoading: isLoadingForecasts } = useQuery({
    queryKey: QUERY_KEYS.FINANCIAL_FORECASTS,
    queryFn: () => AccountingService.getFinancialForecasts(),
  });

  const calculateKPIs = useMutation({
    mutationFn: async ({
      periodStart,
      periodEnd,
      fiscalYearId: fyId,
    }: {
      periodStart: string;
      periodEnd: string;
      fiscalYearId?: string;
    }) => {
      const accounts = await AccountingService.getAccounts();
      const typedAccounts = (accounts || []) as Account[];

      const totalAssets = safeReduce(
        safeFilter(typedAccounts, (a: Account) => a.account_type === 'asset'),
        (sum: number, a: Account) => sum + (a.current_balance || 0),
        0
      );

      const currentAssets = safeReduce(
        safeFilter(typedAccounts, (a: Account) => a.account_type === 'asset' && a.code.startsWith('1')),
        (sum: number, a: Account) => sum + (a.current_balance || 0),
        0
      );

      const currentLiabilities = safeReduce(
        safeFilter(typedAccounts, (a: Account) => a.account_type === 'liability' && a.code.startsWith('21')),
        (sum: number, a: Account) => sum + (a.current_balance || 0),
        0
      );

      const totalLiabilities = safeReduce(
        safeFilter(typedAccounts, (a: Account) => a.account_type === 'liability'),
        (sum: number, a: Account) => sum + (a.current_balance || 0),
        0
      );

      const totalEquity = safeReduce(
        safeFilter(typedAccounts, (a: Account) => a.account_type === 'equity'),
        (sum: number, a: Account) => sum + (a.current_balance || 0),
        0
      );

      // جلب سطور القيود للفترة المحددة
      const journalLines = await AccountingService.getJournalEntriesWithLines();
      const filteredLines = (journalLines || []).flatMap(entry => 
        (entry.journal_entry_lines || []).filter((line: any) => {
          const entryDate = entry.entry_date;
          return entry.status === 'posted' && 
                 entryDate >= periodStart && 
                 entryDate <= periodEnd;
        }).map((line: any) => ({
          ...line,
          accounts: line.accounts,
          journal_entries: { entry_date: entry.entry_date }
        }))
      );

      const typedLines = filteredLines as JournalEntryLine[];

      const totalRevenue = safeReduce(
        safeFilter(typedLines, (line: JournalEntryLine) => line.accounts?.account_type === 'revenue'),
        (sum: number, line: JournalEntryLine) => sum + (line.credit_amount - line.debit_amount),
        0
      );

      const totalExpenses = safeReduce(
        safeFilter(typedLines, (line: JournalEntryLine) => line.accounts?.account_type === 'expense'),
        (sum: number, line: JournalEntryLine) => sum + (line.debit_amount - line.credit_amount),
        0
      );

      const netIncome = totalRevenue - totalExpenses;

      const kpiData: Omit<FinancialKPI, 'id' | 'created_at'>[] = [
        {
          kpi_name: 'current_ratio',
          kpi_category: 'liquidity',
          kpi_value: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
          kpi_target: 2.0,
          period_start: periodStart,
          period_end: periodEnd,
          fiscal_year_id: fyId,
          metadata: {
            current_assets: currentAssets,
            current_liabilities: currentLiabilities,
          },
        },
        {
          kpi_name: 'quick_ratio',
          kpi_category: 'liquidity',
          kpi_value: currentLiabilities > 0 ? (currentAssets * 0.8) / currentLiabilities : 0,
          kpi_target: 1.5,
          period_start: periodStart,
          period_end: periodEnd,
          fiscal_year_id: fyId,
        },
        {
          kpi_name: 'debt_to_assets',
          kpi_category: 'leverage',
          kpi_value: totalAssets > 0 ? totalLiabilities / totalAssets : 0,
          kpi_target: 0.5,
          period_start: periodStart,
          period_end: periodEnd,
          fiscal_year_id: fyId,
        },
        {
          kpi_name: 'debt_to_equity',
          kpi_category: 'leverage',
          kpi_value: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
          kpi_target: 1.0,
          period_start: periodStart,
          period_end: periodEnd,
          fiscal_year_id: fyId,
        },
        {
          kpi_name: 'profit_margin',
          kpi_category: 'profitability',
          kpi_value: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
          kpi_target: 15,
          period_start: periodStart,
          period_end: periodEnd,
          fiscal_year_id: fyId,
          metadata: {
            total_revenue: totalRevenue,
            net_income: netIncome,
          },
        },
        {
          kpi_name: 'roa',
          kpi_category: 'profitability',
          kpi_value: totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0,
          kpi_target: 10,
          period_start: periodStart,
          period_end: periodEnd,
          fiscal_year_id: fyId,
        },
        {
          kpi_name: 'roe',
          kpi_category: 'profitability',
          kpi_value: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,
          kpi_target: 15,
          period_start: periodStart,
          period_end: periodEnd,
          fiscal_year_id: fyId,
        },
        {
          kpi_name: 'expense_ratio',
          kpi_category: 'efficiency',
          kpi_value: totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0,
          kpi_target: 70,
          period_start: periodStart,
          period_end: periodEnd,
          fiscal_year_id: fyId,
        },
      ];

      const insertData = kpiData.map(kpi => ({
        ...kpi,
        metadata: kpi.metadata as unknown as Json,
      }));

      await AccountingService.saveFinancialKPIs(insertData);

      return kpiData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_kpis'] });
      toast({
        title: 'تم الحساب',
        description: 'تم حساب مؤشرات الأداء المالي بنجاح',
      });
    },
  });

  const generateForecast = useMutation({
    mutationFn: async ({
      forecastType,
      accountId,
      months = 3,
    }: {
      forecastType: 'revenue' | 'expense' | 'cash_flow';
      accountId?: string;
      months?: number;
    }) => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 12);

      // جلب البيانات التاريخية
      const journalEntries = await AccountingService.getJournalEntriesWithLines();
      const filteredEntries = journalEntries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entry.status === 'posted' && 
               entryDate >= startDate && 
               entryDate <= endDate;
      });

      const monthlyTotals = new Map<string, number>();
      
      filteredEntries.forEach(entry => {
        (entry.journal_entry_lines || []).forEach((line: any) => {
          const matchesAccount = !accountId || line.account_id === accountId;
          const matchesType = !forecastType || 
            (forecastType === 'revenue' && line.accounts?.account_type === 'revenue') ||
            (forecastType === 'expense' && line.accounts?.account_type === 'expense');

          if (matchesAccount || matchesType) {
            const month = new Date(entry.entry_date).toISOString().substring(0, 7);
            const amount = forecastType === 'revenue' 
              ? line.credit_amount - line.debit_amount
              : line.debit_amount - line.credit_amount;
            
            monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + amount);
          }
        });
      });

      const totals = Array.from(monthlyTotals.values());
      const avgMonthly = totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;

      const trend = totals.length > 1 
        ? (totals[totals.length - 1] - totals[0]) / totals.length
        : 0;

      const forecasts = [];
      for (let i = 1; i <= months; i++) {
        const forecastDate = new Date();
        forecastDate.setMonth(forecastDate.getMonth() + i);
        
        const periodStart = new Date(forecastDate.getFullYear(), forecastDate.getMonth(), 1);
        const periodEnd = new Date(forecastDate.getFullYear(), forecastDate.getMonth() + 1, 0);

        const forecastedAmount = avgMonthly + (trend * i);
        const confidence = Math.max(0.5, 1 - (i * 0.1));

        forecasts.push({
          forecast_type: forecastType,
          account_id: accountId || null,
          period_start: periodStart.toISOString().split('T')[0],
          period_end: periodEnd.toISOString().split('T')[0],
          forecasted_amount: Math.max(0, forecastedAmount),
          confidence_level: confidence,
          model_used: 'moving_average',
          metadata: { avg_monthly: avgMonthly, trend },
        });
      }

      await AccountingService.saveFinancialForecasts(forecasts);

      return forecasts;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial_forecasts'] });
      toast({
        title: 'تم التنبؤ',
        description: 'تم إنشاء التنبؤات المالية بنجاح',
      });
    },
  });

  return {
    kpis: (kpis || []) as FinancialKPI[],
    forecasts: forecasts || [],
    isLoading: isLoadingKPIs || isLoadingForecasts,
    calculateKPIs: calculateKPIs.mutateAsync,
    generateForecast: generateForecast.mutateAsync,
  };
}
