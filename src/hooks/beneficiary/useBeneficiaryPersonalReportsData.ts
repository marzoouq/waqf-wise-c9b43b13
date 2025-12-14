/**
 * Hook for BeneficiaryReports page (personal reports)
 * يجلب بيانات التقارير الشخصية للمستفيد مع التوزيعات من heir_distributions
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { BeneficiaryService } from "@/services";
import { QUERY_KEYS } from "@/lib/query-keys";

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
  const { data: beneficiary, error: beneficiaryError, refetch: refetchBeneficiary } = useQuery({
    queryKey: QUERY_KEYS.MY_BENEFICIARY(user?.id),
    queryFn: async () => {
      if (!user?.id) return null;
      return BeneficiaryService.getByUserId(user.id) as Promise<Beneficiary | null>;
    },
    enabled: !!user?.id,
  });

  // جلب التوزيعات من heir_distributions للسنة المحددة
  const { data: distributions = [], isLoading: isLoadingDistributions, error: distributionsError, refetch: refetchDistributions } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_YEARLY_DISTRIBUTIONS(beneficiary?.id, parseInt(selectedYear)),
    queryFn: async () => {
      if (!beneficiary?.id) return [];
      return BeneficiaryService.getYearlyDistributions(beneficiary.id, selectedYear) as Promise<HeirDistribution[]>;
    },
    enabled: !!beneficiary?.id && !!selectedYear,
  });

  // جلب الطلبات
  const { data: requests = [] } = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_YEARLY_REQUESTS(beneficiary?.id, parseInt(selectedYear)),
    queryFn: async () => {
      if (!beneficiary?.id) return [];
      return BeneficiaryService.getYearlyRequests(beneficiary.id, selectedYear) as Promise<Request[]>;
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

  const refetch = () => {
    refetchBeneficiary();
    refetchDistributions();
  };

  return {
    beneficiary,
    distributions,
    requests,
    yearlyStats,
    monthlyData,
    requestsStatusData,
    isLoading: isLoadingDistributions,
    error: beneficiaryError || distributionsError,
    refetch,
    selectedYear,
    setSelectedYear,
    reportType,
    setReportType,
  };
}
