/**
 * Dashboard KPIs Hook - خطاف مؤشرات الأداء
 * @version 2.8.43
 * 
 * @description
 * يستخدم useUnifiedKPIs داخلياً ويوفر واجهة مبسطة
 * للحفاظ على التوافق مع الكود القديم
 * 
 * @deprecated استخدم useUnifiedKPIs مباشرة للحصول على بيانات أكثر شمولية
 */

import { useUnifiedKPIs } from './useUnifiedKPIs';

export interface DashboardKPIs {
  beneficiaries: number;
  properties: number;
  totalPayments: number;
  activeContracts: number;
}

/**
 * @deprecated استخدم useUnifiedKPIs مباشرة
 */
export function useDashboardKPIs() {
  const query = useUnifiedKPIs();

  // تحويل البيانات الموحدة للصيغة القديمة
  const data: DashboardKPIs | undefined = query.data ? {
    beneficiaries: query.data.totalBeneficiaries || 0,
    properties: query.data.totalProperties || 0,
    totalPayments: query.data.totalRevenue || 0,
    activeContracts: query.data.activeProperties || 0, // استخدام activeProperties كبديل
  } : undefined;

  return {
    ...query,
    data,
    refresh: query.refresh,
  };
}
