/**
 * Hook لجلب إحصائيات النظام الشاملة للناظر
 * يستخدم في NazerSystemOverview component
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SystemOverviewStats {
  beneficiaries: {
    total: number;
    active: number;
    percentage: number;
  };
  properties: {
    total: number;
    occupied: number;
    percentage: number;
  };
  contracts: {
    total: number;
    active: number;
  };
  loans: {
    total: number;
    active: number;
    amount: number;
  };
  payments: {
    total: number;
    amount: number;
  };
  requests: {
    total: number;
    pending: number;
  };
  documents: number;
}

async function fetchSystemOverviewStats(): Promise<SystemOverviewStats> {
  const [
    beneficiariesRes,
    propertiesRes,
    contractsRes,
    loansRes,
    paymentsRes,
    requestsRes,
    documentsRes,
  ] = await Promise.all([
    supabase.from("beneficiaries").select("id, status", { count: "exact" }),
    supabase.from("properties").select("id, status", { count: "exact" }),
    supabase.from("contracts").select("id, status", { count: "exact" }),
    supabase.from("loans").select("id, status, loan_amount, paid_amount", { count: "exact" }),
    supabase.from("rental_payments").select("id, amount_paid, status").eq("status", "مدفوع"),
    supabase.from("beneficiary_requests").select("id, status", { count: "exact" }),
    supabase.from("documents").select("id", { count: "exact" }),
  ]);

  const beneficiaries = beneficiariesRes.data || [];
  const properties = propertiesRes.data || [];
  const contracts = contractsRes.data || [];
  const loans = loansRes.data || [];
  const payments = paymentsRes.data || [];
  const requests = requestsRes.data || [];

  const activeBeneficiaries = beneficiaries.filter(b => b.status === "نشط").length;
  const occupiedProperties = properties.filter(p => p.status === "نشط").length;
  const activeContracts = contracts.filter(c => c.status === "نشط" || c.status === "active").length;
  const activeLoans = loans.filter(l => l.status === "نشط" || l.status === "active").length;
  const totalLoansAmount = loans.reduce((sum, l) => sum + ((l.loan_amount || 0) - (l.paid_amount || 0)), 0);
  const totalPayments = payments.reduce((sum, p) => sum + (p.amount_paid || 0), 0);
  const pendingRequests = requests.filter(r => r.status === "pending" || r.status === "معلق").length;

  return {
    beneficiaries: {
      total: beneficiaries.length,
      active: activeBeneficiaries,
      percentage: beneficiaries.length > 0 ? Math.round((activeBeneficiaries / beneficiaries.length) * 100) : 0,
    },
    properties: {
      total: properties.length,
      occupied: occupiedProperties,
      percentage: properties.length > 0 ? Math.round((occupiedProperties / properties.length) * 100) : 0,
    },
    contracts: {
      total: contracts.length,
      active: activeContracts,
    },
    loans: {
      total: loans.length,
      active: activeLoans,
      amount: totalLoansAmount,
    },
    payments: {
      total: payments.length,
      amount: totalPayments,
    },
    requests: {
      total: requests.length,
      pending: pendingRequests,
    },
    documents: documentsRes.count || 0,
  };
}

export function useNazerSystemOverview() {
  return useQuery({
    queryKey: ["nazer-system-overview"],
    queryFn: fetchSystemOverviewStats,
    staleTime: 2 * 60 * 1000,
  });
}
