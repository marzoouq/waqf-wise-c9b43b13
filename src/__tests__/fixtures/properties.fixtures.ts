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

// Helper functions
export const getActiveProperties = () => [];
export const getPropertyById = (id: string) => undefined;
export const getActiveContracts = () => [];
export const getContractsByPropertyId = (propertyId: string) => [];
export const getTenantById = (id: string) => undefined;
