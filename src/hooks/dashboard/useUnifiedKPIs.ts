import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import { useEffect, useCallback } from "react";

export interface UnifiedKPIsData {
  // المستفيدون
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  
  // العائلات
  totalFamilies: number;
  
  // العقارات
  totalProperties: number;
  activeProperties: number;
  occupiedProperties: number;
  
  // المالية
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  availableBudget: number;
  monthlyReturn: number;
  totalAssets: number;
  
  // الأقلام
  totalFunds: number;
  activeFunds: number;
  
  // الطلبات
  pendingRequests: number;
  overdueRequests: number;
  
  // القروض
  pendingLoans: number;
  
  // التحديث
  lastUpdated: Date;
}

async function fetchUnifiedKPIs(): Promise<UnifiedKPIsData> {
  const now = new Date();

  // جلب جميع البيانات بالتوازي
  const [
    beneficiariesResult,
    familiesResult,
    propertiesResult,
    contractsResult,
    fundsResult,
    requestsResult,
    loansResult,
    paymentsResult,
    journalEntriesResult
  ] = await Promise.all([
    // المستفيدون
    supabase.from('beneficiaries').select('id, status'),
    
    // العائلات
    supabase.from('families').select('id'),
    
    // العقارات
    supabase.from('properties').select('id, status'),
    
    // العقود النشطة
    supabase.from('contracts').select('id, status, monthly_rent'),
    
    // الأقلام
    supabase.from('funds').select('id, is_active'),
    
    // الطلبات
    supabase.from('beneficiary_requests').select('id, status, is_overdue'),
    
    // القروض
    supabase.from('loans').select('id, status'),
    
    // المدفوعات
    supabase.from('payments').select('id, amount, payment_type, status'),
    
    // سطور القيود المحاسبية
    supabase.from('journal_entry_lines').select('id, debit_amount, credit_amount')
  ]);

  // حساب المؤشرات
  const beneficiaries = beneficiariesResult.data || [];
  const totalBeneficiaries = beneficiaries.length;
  const activeBeneficiaries = beneficiaries.filter(b => b.status === 'نشط' || b.status === 'active').length;

  const totalFamilies = familiesResult.data?.length || 0;

  const properties = propertiesResult.data || [];
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'نشط' || p.status === 'active').length;

  const contracts = contractsResult.data || [];
  const occupiedProperties = contracts.filter(c => c.status === 'ساري' || c.status === 'active').length;
  const monthlyReturn = contracts
    .filter(c => c.status === 'ساري' || c.status === 'active')
    .reduce((sum, c) => sum + (c.monthly_rent || 0), 0);

  const funds = fundsResult.data || [];
  const totalFunds = funds.length;
  const activeFunds = funds.filter(f => f.is_active).length;

  const requests = requestsResult.data || [];
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'معلق').length;
  const overdueRequests = requests.filter(r => r.is_overdue).length;

  const loans = loansResult.data || [];
  const pendingLoans = loans.filter(l => l.status === 'active' || l.status === 'نشط').length;

  const payments = paymentsResult.data || [];
  const completedPayments = payments.filter(p => p.status === 'مدفوع' || p.status === 'completed');
  const totalRevenue = completedPayments
    .filter(p => p.payment_type === 'payment' || p.payment_type === 'إيجار')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  // حساب المصروفات من سطور القيود (الدائن = مصروفات)
  const journalLines = journalEntriesResult.data || [];
  const totalExpenses = journalLines.reduce((sum, line) => sum + (line.credit_amount || 0), 0);

  const netIncome = totalRevenue - totalExpenses;
  const availableBudget = netIncome > 0 ? netIncome : 0;
  const totalAssets = totalRevenue; // تبسيط - يمكن تحسينه لاحقاً

  return {
    totalBeneficiaries,
    activeBeneficiaries,
    totalFamilies,
    totalProperties,
    activeProperties,
    occupiedProperties,
    totalRevenue,
    totalExpenses,
    netIncome,
    availableBudget,
    monthlyReturn,
    totalAssets,
    totalFunds,
    activeFunds,
    pendingRequests,
    overdueRequests,
    pendingLoans,
    lastUpdated: now
  };
}

export function useUnifiedKPIs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['unified-kpis'],
    queryFn: fetchUnifiedKPIs,
    ...QUERY_CONFIG.DASHBOARD_KPIS
  });

  // الاشتراك في التحديثات المباشرة
  useEffect(() => {
    const tables = ['beneficiaries', 'properties', 'contracts', 'payments', 'journal_entries', 'loans', 'beneficiary_requests', 'families', 'funds'];
    
    const channels = tables.map(table => 
      supabase
        .channel(`unified-kpis-${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
          queryClient.invalidateQueries({ queryKey: ['unified-kpis'] });
        })
        .subscribe()
    );

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [queryClient]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['unified-kpis'] });
  }, [queryClient]);

  return {
    ...query,
    refresh,
    lastUpdated: query.data?.lastUpdated
  };
}
