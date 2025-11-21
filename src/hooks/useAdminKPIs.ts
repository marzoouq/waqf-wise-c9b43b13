import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QUERY_CONFIG } from "@/lib/queryOptimization";
import type { AdminKPI, FinancialLine } from "@/types/admin";

export function useAdminKPIs() {
  return useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async (): Promise<AdminKPI> => {
      // Fetch all data in parallel
      const [
        beneficiariesData,
        familiesData,
        propertiesData,
        fundsData,
        requestsData,
        financialData,
      ] = await Promise.all([
        supabase.from("beneficiaries").select("id, status", { count: "exact" }),
        supabase.from("families").select("id", { count: "exact" }),
        supabase.from("properties").select("id, status", { count: "exact" }),
        supabase.from("funds").select("id, is_active", { count: "exact" }),
        supabase.from("beneficiary_requests").select("id, status, sla_due_at", { count: "exact" }),
        supabase.from("journal_entry_lines").select(`
          debit_amount,
          credit_amount,
          accounts (
            account_type,
            account_nature
          )
        `),
      ]);

      // Calculate beneficiaries
      const totalBeneficiaries = beneficiariesData.count || 0;
      const activeBeneficiaries = beneficiariesData.data?.filter(b => b.status === "نشط").length || 0;

      // Calculate families
      const totalFamilies = familiesData.count || 0;

      // Calculate properties
      const totalProperties = propertiesData.count || 0;
      const occupiedProperties = propertiesData.data?.filter(p => p.status === "مؤجر").length || 0;

      // Calculate funds
      const totalFunds = fundsData.count || 0;
      const activeFunds = fundsData.data?.filter(f => f.is_active).length || 0;

      // Calculate requests (including both "معلق" and "قيد المراجعة")
      const pendingStatuses = ["معلق", "قيد المراجعة", "مقدم"];
      const pendingRequests = requestsData.data?.filter(r => pendingStatuses.includes(r.status || "")).length || 0;
      const now = new Date();
      const overdueRequests = requestsData.data?.filter(r => 
        pendingStatuses.includes(r.status || "") && r.sla_due_at && new Date(r.sla_due_at) < now
      ).length || 0;

      // Calculate financial data
      let totalRevenue = 0;
      let totalExpenses = 0;

      financialData.data?.forEach((line: FinancialLine) => {
        const accountType = line.accounts?.account_type;
        const accountNature = line.accounts?.account_nature;
        const debit = Number(line.debit_amount || 0);
        const credit = Number(line.credit_amount || 0);

        if (accountType === 'revenue') {
          totalRevenue += accountNature === 'credit' ? credit - debit : debit - credit;
        } else if (accountType === 'expense') {
          totalExpenses += accountNature === 'debit' ? debit - credit : credit - debit;
        }
      });

      const netIncome = totalRevenue - totalExpenses;

      return {
        totalBeneficiaries,
        activeBeneficiaries,
        totalFamilies,
        totalProperties,
        occupiedProperties,
        totalFunds,
        activeFunds,
        pendingRequests,
        overdueRequests,
        totalRevenue,
        totalExpenses,
        netIncome,
      };
    },
    ...QUERY_CONFIG.DASHBOARD_KPIS,
  });
}
