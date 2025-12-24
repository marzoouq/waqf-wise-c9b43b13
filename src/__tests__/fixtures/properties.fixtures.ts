/**
 * بيانات اختبار العقارات
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

// تصديرات فارغة
export const realProperties: any[] = [];
export const realContracts: any[] = [];
export const realTenants: any[] = [];
export const mockProperties: any[] = [];
export const mockContracts: any[] = [];
export const mockTenants: any[] = [];

export const propertyStats = {
  total: 0,
  active: 0,
  vacant: 0,
  totalUnits: 0,
  totalMonthlyRevenue: 0,
};

export const contractStats = {
  total: 0,
  active: 0,
  draft: 0,
  totalAmount: 0,
};

// AI-related property analysis - structured to match test expectations
export const mockPropertyAnalysis = {
  results: {
    occupancy_rate: 85,
    revenue_trend: 'increasing',
    recommendations: [] as string[],
    predicted_revenue: {
      next_year: 560000,
      next_quarter: 140000,
      next_month: 45000,
    },
    maintenance_score: 72,
  },
};

export const mockRevenuePrediction = {
  predictions: [] as any[],
  factors: [] as string[],
};

export const mockMaintenanceSuggestions: any[] = [];

// Helper functions
export const getActiveProperties = () => [];
export const getPropertyById = (id: string) => undefined;
export const getActiveContracts = () => [];
export const getContractsByPropertyId = (propertyId: string) => [];
export const getTenantById = (id: string) => undefined;
