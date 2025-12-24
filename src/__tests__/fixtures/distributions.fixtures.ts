/**
 * Distributions Fixtures - بيانات وهمية للتوزيعات
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

// ==================== Types ====================
export type DistributionPattern = 'equal' | 'shariah' | 'need_based' | 'custom';

// تصديرات فارغة
export const mockDistributions: any[] = [];
export const mockDistributionDetails: any[] = [];
export const mockBankTransfers: any[] = [];
export const mockBankTransferDetails: any[] = [];
export const mockDistributionApprovals: any[] = [];
export const mockHeirDistributions: any[] = [];

export const mockDistributionSettings = {
  default_pattern: 'shariah' as DistributionPattern,
  distribution_frequency: 'monthly',
  deductions: {
    nazer_percentage: 10,
    charity_percentage: 5,
    development_percentage: 5,
  },
};

export const mockDistributionSummary = {
  total_distributions: 0,
  total_amount: 0,
  total_beneficiaries: 0,
  average_per_beneficiary: 0,
  by_status: {
    completed: 0,
    pending: 0,
    cancelled: 0,
  },
  by_pattern: {},
  monthly_data: [] as any[],
};

export const mockSimulationResult = {
  distributions: [] as any[],
  beneficiaries: [] as any[],
  timestamp: new Date().toISOString(),
  summary: {
    total: 0,
    net_distribution: 0,
    deductions: {
      nazer: 0,
      charity: 0,
      development: 0,
    },
  },
};

// Helper Functions - return objects with required properties
export const createMockDistribution = (overrides: Record<string, any> = {}) => ({
  id: 'dist-new',
  name: 'توزيع جديد',
  total_amount: 100000,
  status: 'pending',
  pattern: 'shariah',
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockBankTransfer = (overrides: Record<string, any> = {}) => ({
  id: 'transfer-new',
  file_number: 'TRF-001',
  status: 'pending',
  total_amount: 0,
  total_transactions: 0,
  ...overrides,
});

export const createMockDistributionDetail = (overrides: Record<string, any> = {}) => ({
  id: 'detail-new',
  distribution_id: 'dist-1',
  beneficiary_id: 'ben-1',
  amount: 0,
  share_percentage: 0,
  ...overrides,
});

export const distributionsFixtures = {
  distributions: [],
  distributionDetails: [],
  bankTransfers: [],
  bankTransferDetails: [],
  settings: mockDistributionSettings,
  summary: mockDistributionSummary,
  simulationResult: mockSimulationResult,
  approvals: [],
  heirDistributions: [],
};
