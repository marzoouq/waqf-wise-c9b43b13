/**
 * Hook for BeneficiaryReports page (personal reports)
 * يجلب بيانات التقارير الشخصية للمستفيد مع التوزيعات من heir_distributions
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface HeirDistribution {
  share_amount: number;
  distribution_date: string;
  heir_type: string;
  notes: string | null;
}

interface Request {
  status: string | null;
  amount: number | null;
  created_at: string | null;
}

interface Beneficiary {
  id: string;
  full_name: string;
  beneficiary_number: string | null;
  status: string;
  user_id: string | null;
}

interface MonthlyData {
  month: string;
  amount: number;
  count: number;
}

interface RequestStatusData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export function useBeneficiaryPersonalReportsData() {
  const { user } = useAuth();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [reportType, setReportType] = useState<'annual' | 'monthly' | 'quarterly'>('annual');

  // جلب بيانات المستفيد
  const { data: beneficiary } = useQuery({
    queryKey: ['my-beneficiary', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('beneficiaries')
        .select('id, full_name, beneficiary_number, status, user_id')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as Beneficiary;
    },
    enabled: !!user?.id,
  });

  // جلب التوزيعات من heir_distributions للسنة المحددة
  const { data: distributions = [], isLoading: isLoadingDistributions } = useQuery({
    queryKey: ['beneficiary-yearly-distributions', beneficiary?.id, selectedYear],
    queryFn: async () => {
      if (!beneficiary?.id) return [];

      const { data, error } = await supabase
        .from('heir_distributions')
        .select('share_amount, distribution_date, heir_type, notes')
        .eq('beneficiary_id', beneficiary.id)
        .gte('distribution_date', `${selectedYear}-01-01`)
        .lte('distribution_date', `${selectedYear}-12-31`)
        .order('distribution_date', { ascending: true });

      if (error) throw error;
      return data as HeirDistribution[];
    },
    enabled: !!beneficiary?.id && !!selectedYear,
  });

  // جلب الطلبات
  const { data: requests = [] } = useQuery({
    queryKey: ['beneficiary-yearly-requests', beneficiary?.id, selectedYear],
    queryFn: async () => {
      if (!beneficiary?.id) return [];

      const { data, error } = await supabase
        .from('beneficiary_requests')
        .select('status, amount, created_at')
        .eq('beneficiary_id', beneficiary.id)
        .gte('created_at', `${selectedYear}-01-01`)
        .lte('created_at', `${selectedYear}-12-31`);

      if (error) throw error;
      return data as Request[];
    },
    enabled: !!beneficiary?.id && !!selectedYear,
  });

  // إحصائيات السنة من التوزيعات
  const yearlyStats = {
    totalReceived: distributions.reduce((sum, d) => sum + Number(d.share_amount), 0),
    paymentsCount: distributions.length,
    avgPayment: distributions.length > 0 
      ? distributions.reduce((sum, d) => sum + Number(d.share_amount), 0) / distributions.length 
      : 0,
    requestsCount: requests.length,
    approvedRequests: requests.filter(r => r.status === 'approved').length,
  };

  // بيانات المخطط الشهري
  const monthlyData: MonthlyData[] = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const monthDistributions = distributions.filter(d => {
      const distMonth = new Date(d.distribution_date).getMonth() + 1;
      return distMonth === month;
    });
    
    return {
      month: format(new Date(2024, i, 1), 'MMM', { locale: ar }),
      amount: monthDistributions.reduce((sum, d) => sum + Number(d.share_amount), 0),
      count: monthDistributions.length,
    };
  });

  // بيانات حالة الطلبات
  const requestsStatusData: RequestStatusData[] = [
    { name: 'معتمد', value: requests.filter(r => r.status === 'approved').length },
    { name: 'قيد المراجعة', value: requests.filter(r => r.status === 'pending').length },
    { name: 'مرفوض', value: requests.filter(r => r.status === 'rejected').length },
  ].filter(item => item.value > 0);

  return {
    beneficiary,
    distributions,
    requests,
    yearlyStats,
    monthlyData,
    requestsStatusData,
    isLoading: isLoadingDistributions,
    selectedYear,
    setSelectedYear,
    reportType,
    setReportType,
  };
}
