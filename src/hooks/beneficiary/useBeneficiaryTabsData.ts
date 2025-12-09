/**
 * Beneficiary Tabs Data Hooks
 * Provides data fetching for beneficiary portal tabs
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BeneficiaryService } from "@/services/beneficiary.service";
import { ApprovalService } from "@/services/approval.service";
import { AccountingService } from "@/services/accounting.service";
import { DistributionService } from "@/services/distribution.service";
import { PropertyService } from "@/services/property.service";
import { RentalPaymentService } from "@/services/rental-payment.service";
import { QUERY_KEYS } from "@/lib/query-keys";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Hook for approvals log tab
export function useApprovalsLog(enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.APPROVALS_LOG_BENEFICIARY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("approval_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled,
  });
}

// Hook for bank accounts (waqf accounts visible to beneficiaries)
export function useBeneficiaryBankAccounts(enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.BANK_ACCOUNTS_BENEFICIARY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      return data;
    },
    enabled,
  });
}

// Hook for beneficiary documents
export function useBeneficiaryDocuments(beneficiaryId: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_DOCUMENTS(beneficiaryId),
    queryFn: () => BeneficiaryService.getDocuments(beneficiaryId),
    enabled: !!beneficiaryId,
  });

  const deleteMutation = useMutation({
    mutationFn: (documentId: string) => BeneficiaryService.deleteDocument(documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BENEFICIARY_DOCUMENTS() });
      toast.success("تم حذف المستند بنجاح");
    },
    onError: () => {
      toast.error("فشل حذف المستند");
    },
  });

  const viewDocument = async (filePath: string) => {
    const { data } = await supabase.storage
      .from("beneficiary-documents")
      .createSignedUrl(filePath, 3600);

    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  return {
    ...query,
    deleteDocument: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    viewDocument,
  };
}

// Hook for beneficiary statements (payments)
export function useBeneficiaryStatements(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_PROFILE_PAYMENTS(beneficiaryId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("beneficiary_id", beneficiaryId)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!beneficiaryId,
  });
}

// Hook for annual disclosures
export function useDisclosures(enabled: boolean = true) {
  return useQuery({
    queryKey: QUERY_KEYS.ANNUAL_DISCLOSURES_BENEFICIARY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("annual_disclosures")
        .select("*")
        .order("year", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    },
    enabled,
  });
}

// Hook for distribution pie chart data
export function useDistributionChartData() {
  return useQuery({
    queryKey: QUERY_KEYS.DISTRIBUTION_PIE_CHART,
    queryFn: async () => {
      const { data: latestDistribution, error: distError } = await supabase
        .from("distributions")
        .select("id, total_amount")
        .eq("status", "معتمد")
        .order("distribution_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (distError || !latestDistribution) {
        return [];
      }

      const { data: details, error: detailsError } = await supabase
        .from("distribution_details")
        .select("allocated_amount, beneficiary_type")
        .eq("distribution_id", latestDistribution.id);

      if (detailsError || !details?.length) {
        return [];
      }

      const typeData: { [key: string]: number } = {};
      
      details.forEach((detail) => {
        const type = detail.beneficiary_type || 'أخرى';
        if (!typeData[type]) {
          typeData[type] = 0;
        }
        typeData[type] += Number(detail.allocated_amount || 0);
      });

      const total = Object.values(typeData).reduce((sum, val) => sum + val, 0);

      if (total === 0) return [];

      return Object.entries(typeData).map(([name, value]) => ({
        name,
        value: Math.round(value),
        percentage: Math.round((value / total) * 100),
      }));
    },
  });
}

// Hook for beneficiary requests
export function useBeneficiaryRequestsTab(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.BENEFICIARY_PROFILE_REQUESTS(beneficiaryId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("beneficiary_requests")
        .select(`
          *,
          request_types (
            name_ar,
            requires_amount
          )
        `)
        .eq("beneficiary_id", beneficiaryId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!beneficiaryId,
  });
}

// Hook for yearly comparison chart
export function useYearlyComparison(beneficiaryId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.YEARLY_COMPARISON(beneficiaryId),
    queryFn: async () => {
      const currentYear = new Date().getFullYear();
      const years = [currentYear - 1, currentYear];

      const results = await Promise.all(
        years.map(async (year) => {
          const { data, error } = await supabase
            .from("payments")
            .select("amount")
            .eq("beneficiary_id", beneficiaryId)
            .gte("payment_date", `${year}-01-01`)
            .lte("payment_date", `${year}-12-31`);

          if (error) throw error;

          const total = data?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
          const count = data?.length || 0;

          return {
            year: year.toString(),
            total,
            count,
            average: count > 0 ? total / count : 0,
          };
        })
      );

      return results;
    },
    enabled: !!beneficiaryId,
  });
}

// Hook for monthly revenue chart
export function useMonthlyRevenue() {
  return useQuery({
    queryKey: QUERY_KEYS.MONTHLY_REVENUE_CHART,
    queryFn: async () => {
      const { data: payments, error } = await supabase
        .from("rental_payments")
        .select("payment_date, amount_due")
        .eq("status", "مدفوع")
        .order("payment_date", { ascending: false })
        .limit(200);

      if (error) throw error;
      if (!payments?.length) return [];

      const monthlyData: { [key: string]: number } = {};
      
      payments.forEach((payment) => {
        const date = new Date(payment.payment_date);
        const monthKey = date.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = 0;
        }
        monthlyData[monthKey] += Number(payment.amount_due);
      });

      const chartData = Object.entries(monthlyData)
        .map(([month, revenue]) => ({
          month,
          revenue: Math.round(revenue),
        }));
      
      return chartData.length > 0 ? [...chartData].reverse().slice(-12) : [];
    },
  });
}

// Hook for property stats
interface RentalPaymentWithContract {
  amount_paid: number | null;
  tax_amount: number | null;
  contracts: {
    payment_frequency: string | null;
  } | null;
}

export function usePropertyStats() {
  return useQuery({
    queryKey: QUERY_KEYS.PROPERTY_STATS_COMBINED,
    queryFn: async () => {
      const [propertiesRes, paymentsRes] = await Promise.all([
        supabase
          .from("properties")
          .select(`id, name, location, total_units, occupied_units, status`)
          .order("name"),
        supabase
          .from("rental_payments")
          .select(`amount_paid, tax_amount, contracts!inner (payment_frequency)`)
          .eq("status", "مدفوع"),
      ]);

      if (propertiesRes.error) throw propertiesRes.error;
      if (paymentsRes.error) throw paymentsRes.error;

      return {
        properties: propertiesRes.data || [],
        payments: (paymentsRes.data || []) as RentalPaymentWithContract[],
      };
    },
  });
}
