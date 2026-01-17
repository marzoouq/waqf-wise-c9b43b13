/**
 * Hook للبيانات المالية الموحدة
 * Unified Financial Data Hook
 * 
 * يوفر واجهة موحدة للحصول على البيانات المالية من خدمة البيانات الموحدة
 * مع دعم التخزين المؤقت والتحديث التلقائي
 * 
 * @version 1.0.0
 */

import { useQuery } from '@tanstack/react-query';
import { UnifiedFinancialService, UnifiedRevenueData, UnifiedDistributionData, UnifiedIncomeData } from '@/services/unified-financial.service';

// ==================== Query Keys ====================

export const UNIFIED_FINANCIAL_KEYS = {
  all: ['unified-financial'] as const,
  revenue: () => [...UNIFIED_FINANCIAL_KEYS.all, 'revenue'] as const,
  distribution: () => [...UNIFIED_FINANCIAL_KEYS.all, 'distribution'] as const,
  income: () => [...UNIFIED_FINANCIAL_KEYS.all, 'income'] as const,
  collection: (propertyId?: string) => [...UNIFIED_FINANCIAL_KEYS.all, 'collection', propertyId] as const,
  totalCollected: (startDate?: string, endDate?: string) => 
    [...UNIFIED_FINANCIAL_KEYS.all, 'totalCollected', startDate, endDate] as const,
};

// ==================== Hooks ====================

/**
 * جلب بيانات الإيرادات الموحدة
 * يستخدم View قاعدة البيانات أو الطريقة الاحتياطية
 */
export function useUnifiedRevenueData() {
  return useQuery({
    queryKey: UNIFIED_FINANCIAL_KEYS.revenue(),
    queryFn: () => UnifiedFinancialService.getRevenueData(),
    staleTime: 1000 * 60 * 2, // 2 دقائق
    gcTime: 1000 * 60 * 10, // 10 دقائق
  });
}

/**
 * جلب بيانات التوزيعات الموحدة
 */
export function useUnifiedDistributionData() {
  return useQuery({
    queryKey: UNIFIED_FINANCIAL_KEYS.distribution(),
    queryFn: () => UnifiedFinancialService.getDistributionData(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * جلب بيانات الدخل الموحدة
 */
export function useUnifiedIncomeData() {
  return useQuery({
    queryKey: UNIFIED_FINANCIAL_KEYS.income(),
    queryFn: () => UnifiedFinancialService.getIncomeData(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * جلب ملخص التحصيل حسب العقار
 */
export function usePropertyCollectionSummary(propertyId?: string) {
  return useQuery({
    queryKey: UNIFIED_FINANCIAL_KEYS.collection(propertyId),
    queryFn: () => UnifiedFinancialService.getPropertyCollectionSummary(propertyId),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * جلب إجمالي المحصّل لفترة معينة
 */
export function useTotalCollected(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: UNIFIED_FINANCIAL_KEYS.totalCollected(startDate, endDate),
    queryFn: () => UnifiedFinancialService.getTotalCollected(startDate, endDate),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * جلب نسبة التحصيل الإجمالية
 */
export function useCollectionPercentage() {
  return useQuery({
    queryKey: [...UNIFIED_FINANCIAL_KEYS.all, 'percentage'],
    queryFn: () => UnifiedFinancialService.getCollectionPercentage(),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * جلب جميع البيانات المالية الموحدة
 * يجمع بين الإيرادات والتوزيعات والدخل
 */
export function useAllUnifiedFinancialData() {
  const revenueQuery = useUnifiedRevenueData();
  const distributionQuery = useUnifiedDistributionData();
  const incomeQuery = useUnifiedIncomeData();

  return {
    revenue: revenueQuery.data,
    distribution: distributionQuery.data,
    income: incomeQuery.data,
    isLoading: revenueQuery.isLoading || distributionQuery.isLoading || incomeQuery.isLoading,
    isError: revenueQuery.isError || distributionQuery.isError || incomeQuery.isError,
    error: revenueQuery.error || distributionQuery.error || incomeQuery.error,
    refetch: () => {
      revenueQuery.refetch();
      distributionQuery.refetch();
      incomeQuery.refetch();
    },
  };
}

// ==================== Types Re-export ====================

export type { UnifiedRevenueData, UnifiedDistributionData, UnifiedIncomeData };
