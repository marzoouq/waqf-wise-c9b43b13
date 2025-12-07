/**
 * useAdminKPIs Hook
 * يستخدم useUnifiedKPIs كمصدر موحد للبيانات
 * @deprecated استخدم useUnifiedKPIs مباشرة
 */

import { useUnifiedKPIs } from "@/hooks/dashboard/useUnifiedKPIs";
import type { AdminKPI } from "@/types/admin";

/**
 * Hook لجلب KPIs لوحة المشرف
 * يستخدم المصدر الموحد useUnifiedKPIs لضمان تطابق البيانات بين جميع اللوحات
 */
export function useAdminKPIs() {
  const { data, isLoading, isError, error, refresh } = useUnifiedKPIs();

  // تحويل البيانات الموحدة إلى صيغة AdminKPI
  const adminData: AdminKPI | undefined = data ? {
    totalBeneficiaries: data.totalBeneficiaries,
    activeBeneficiaries: data.activeBeneficiaries,
    totalFamilies: data.totalFamilies,
    totalProperties: data.totalProperties,
    occupiedProperties: data.occupiedProperties,
    totalFunds: data.totalFunds,
    activeFunds: data.activeFunds,
    pendingRequests: data.pendingRequests,
    overdueRequests: data.overdueRequests,
    totalRevenue: data.totalRevenue,
    totalExpenses: data.totalExpenses,
    netIncome: data.netIncome,
  } : undefined;

  return {
    data: adminData,
    isLoading,
    isError,
    error,
    refresh
  };
}
