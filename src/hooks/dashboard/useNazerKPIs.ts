/**
 * useNazerKPIs Hook
 * يستخدم useUnifiedKPIs كمصدر موحد للبيانات
 * @deprecated استخدم useUnifiedKPIs مباشرة
 */

import { useUnifiedKPIs, type UnifiedKPIsData } from "./useUnifiedKPIs";

export interface NazerKPIData {
  totalAssets: number;
  totalRevenue: number;
  activeBeneficiaries: number;
  activeProperties: number;
  occupiedProperties: number;
  pendingLoans: number;
  availableBudget: number;
  monthlyReturn: number;
}

/**
 * Hook لجلب KPIs الناظر
 * يستخدم المصدر الموحد useUnifiedKPIs لضمان تطابق البيانات بين جميع اللوحات
 */
export function useNazerKPIs() {
  const { data, isLoading, isError, error, refresh } = useUnifiedKPIs();

  // تحويل البيانات الموحدة إلى صيغة NazerKPIData
  const nazerData: NazerKPIData | undefined = data ? {
    totalAssets: data.totalAssets,
    totalRevenue: data.totalRevenue,
    activeBeneficiaries: data.activeBeneficiaries,
    activeProperties: data.activeProperties,
    occupiedProperties: data.occupiedProperties,
    pendingLoans: data.pendingLoans,
    availableBudget: data.availableBudget,
    monthlyReturn: data.monthlyReturn
  } : undefined;

  return {
    data: nazerData,
    isLoading,
    isError,
    error,
    refresh
  };
}
