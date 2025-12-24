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

export const mockDistributionSettings = {};
export const mockDistributionSummary = {
  total_distributions: 0,
  total_amount: 0,
  total_beneficiaries: 0,
  average_per_beneficiary: 0,
  by_status: {},
  by_pattern: {},
  monthly_data: [],
};

export const mockSimulationResult = {};

// Helper Functions
export const createMockDistribution = (overrides = {}) => ({});
export const createMockBankTransfer = (overrides = {}) => ({});
export const createMockDistributionDetail = (overrides = {}) => ({});

export const distributionsFixtures = {
  distributions: [],
  distributionDetails: [],
  bankTransfers: [],
  bankTransferDetails: [],
  settings: {},
  summary: {},
  simulationResult: {},
  approvals: [],
  heirDistributions: [],
};
