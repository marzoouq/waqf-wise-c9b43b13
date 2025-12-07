/**
 * useBeneficiaryProfile Hook
 * Hook محسّن لجلب بيانات المستفيد باستخدام React Query
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Beneficiary } from "@/types/beneficiary";

interface Payment {
  id: string;
  payment_number: string;
  payment_date: string;
  amount: number;
  description: string;
}

interface BeneficiaryProfileData {
  beneficiary: Beneficiary | null;
  payments: Payment[];
}

export const useBeneficiaryProfile = (userId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["beneficiary-profile", userId],
    queryFn: async (): Promise<BeneficiaryProfileData> => {
      if (!userId) {
        return { beneficiary: null, payments: [] };
      }

      // جلب بيانات المستفيد الكاملة
      const { data: beneficiaryData, error: beneficiaryError } = await supabase
        .from("beneficiaries")
        .select("id, full_name, national_id, phone, email, category, status, beneficiary_type, beneficiary_number, gender, date_of_birth, marital_status, family_id, family_name, family_size, address, city, nationality, bank_name, bank_account_number, iban, account_balance, total_received, total_payments, pending_amount, pending_requests, verification_status, eligibility_status, relationship, notes, tribe, priority_level, monthly_income, employment_status, housing_type, number_of_sons, number_of_daughters, number_of_wives, is_head_of_family, user_id, can_login, last_login_at, parent_beneficiary_id, tags, username, login_enabled_at, last_activity_at, last_notification_at, last_verification_date, next_review_date, last_review_date, risk_score, verification_method, verification_notes, verified_at, verified_by, eligibility_notes, notification_preferences, verification_documents, social_status_details, income_sources, disabilities, medical_conditions, created_at, updated_at")
        .eq("user_id", userId)
        .single();

      if (beneficiaryError) throw beneficiaryError;
      if (!beneficiaryData) {
        throw new Error("لم يتم العثور على حساب مستفيد");
      }

      // جلب المدفوعات
      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("id, payment_number, payment_date, amount, description")
        .eq("beneficiary_id", beneficiaryData.id)
        .order("payment_date", { ascending: false })
        .limit(50);

      if (paymentsError) throw paymentsError;

      return {
        beneficiary: beneficiaryData as Beneficiary,
        payments: (paymentsData || []) as Payment[],
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 دقائق
    gcTime: 10 * 60 * 1000, // 10 دقائق
  });

  return {
    beneficiary: data?.beneficiary || null,
    payments: data?.payments || [],
    loading: isLoading,
    error,
  };
};
