/**
 * أنواع استجابات Database Functions
 * Database Function Response Types
 */

/**
 * استجابة get_admin_dashboard_kpis
 */
export interface AdminKPIsResponse {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  totalFamilies: number;
  totalProperties: number;
  occupiedProperties: number;
  totalFunds: number;
  activeFunds: number;
  pendingRequests: number;
  overdueRequests: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

/**
 * تحويل استجابة قاعدة البيانات إلى AdminKPIsResponse
 */
export function parseAdminKPIsResponse(data: unknown): AdminKPIsResponse {
  const raw = data as Record<string, unknown>;
  
  return {
    totalBeneficiaries: Number(raw?.totalBeneficiaries || 0),
    activeBeneficiaries: Number(raw?.activeBeneficiaries || 0),
    totalFamilies: Number(raw?.totalFamilies || 0),
    totalProperties: Number(raw?.totalProperties || 0),
    occupiedProperties: Number(raw?.occupiedProperties || 0),
    totalFunds: Number(raw?.totalFunds || 0),
    activeFunds: Number(raw?.activeFunds || 0),
    pendingRequests: Number(raw?.pendingRequests || 0),
    overdueRequests: Number(raw?.overdueRequests || 0),
    totalRevenue: Number(raw?.totalRevenue || 0),
    totalExpenses: Number(raw?.totalExpenses || 0),
    netIncome: Number(raw?.netIncome || 0),
  };
}
