import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { safeFilter, safeReduce } from '@/lib/utils/array-safe';
import type { Json } from '@/integrations/supabase/types';

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
    queryKey: ['financial_kpis', fiscalYearId],
    queryFn: async () => {
      let query = supabase
        .from('financial_kpis')
        .select('*')
        .order('created_at', { ascending: false });

      if (fiscalYearId) {
        query = query.eq('fiscal_year_id', fiscalYearId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as FinancialKPI[];
    },
  });

  const { data: forecasts, isLoading: isLoadingForecasts } = useQuery({
    queryKey: ['financial_forecasts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('financial_forecasts')
        .select('*, accounts(*)')
        .order('period_start', { ascending: false });

      if (error) throw error;
      return data;
    },
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
      const { data: accounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('is_active', true);

      if (accountsError) throw accountsError;

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

      const { data: journalLines, error: journalError } = await supabase
        .from('journal_entry_lines')
        .select('*, accounts(*), journal_entries!inner(*)')
        .gte('journal_entries.entry_date', periodStart)
        .lte('journal_entries.entry_date', periodEnd)
        .eq('journal_entries.status', 'posted');

      if (journalError) throw journalError;

      const typedLines = (journalLines || []) as JournalEntryLine[];

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

      const { error: insertError } = await supabase
        .from('financial_kpis')
        .insert(insertData);

      if (insertError) throw insertError;

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

      let query = supabase
        .from('journal_entry_lines')
        .select('*, journal_entries!inner(*), accounts(*)')
        .gte('journal_entries.entry_date', startDate.toISOString())
        .lte('journal_entries.entry_date', endDate.toISOString())
        .eq('journal_entries.status', 'posted');

      if (accountId) {
        query = query.eq('account_id', accountId);
      } else if (forecastType === 'revenue') {
        query = query.eq('accounts.account_type', 'revenue');
      } else if (forecastType === 'expense') {
        query = query.eq('accounts.account_type', 'expense');
      }

      const { data: historicalData, error } = await query;

      if (error) throw error;

      const monthlyTotals = new Map<string, number>();
      const typedData = (historicalData || []) as JournalEntryLine[];
      
      typedData.forEach((line: JournalEntryLine) => {
        const month = new Date(line.journal_entries.entry_date).toISOString().substring(0, 7);
        const amount = forecastType === 'revenue' 
          ? line.credit_amount - line.debit_amount
          : line.debit_amount - line.credit_amount;
        
        monthlyTotals.set(month, (monthlyTotals.get(month) || 0) + amount);
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

      const { error: insertError } = await supabase
        .from('financial_forecasts')
        .insert(forecasts);

      if (insertError) throw insertError;

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
    kpis: kpis || [],
    forecasts: forecasts || [],
    isLoading: isLoadingKPIs || isLoadingForecasts,
    calculateKPIs: calculateKPIs.mutateAsync,
    generateForecast: generateForecast.mutateAsync,
  };
}
