/**
 * Distributions Fixtures - بيانات وهمية للتوزيعات
 * Test Fixtures for Distribution System
 */

// ==================== Types ====================
export type DistributionPattern = 'equal' | 'shariah' | 'need_based' | 'custom';

// ==================== Distribution Settings ====================
export const mockDistributionSettings = {
  default_pattern: 'shariah' as DistributionPattern,
  distribution_frequency: 'monthly',
  deductions: {
    nazer_percentage: 10,
    charity_percentage: 5,
    development_percentage: 5,
  },
};

// ==================== Beneficiary Distribution Data ====================
export const mockBeneficiaryDistributions = [
  {
    id: 'bd-1',
    beneficiary_id: 'ben-1',
    beneficiary_name: 'محمد أحمد الوقفي',
    amount: 26666.67,
    share: 33.33,
    category: 'ذكر',
    relationship: 'ابن',
  },
  {
    id: 'bd-2',
    beneficiary_id: 'ben-2',
    beneficiary_name: 'أحمد محمد الوقفي',
    amount: 26666.67,
    share: 33.33,
    category: 'ذكر',
    relationship: 'ابن',
  },
  {
    id: 'bd-3',
    beneficiary_id: 'ben-3',
    beneficiary_name: 'فاطمة أحمد الوقفي',
    amount: 26666.66,
    share: 33.34,
    category: 'أنثى',
    relationship: 'ابنة',
  },
];

// ==================== Distributions ====================
export const mockDistributions = [
  {
    id: 'dist-1',
    name: 'توزيع الربع الأول 2025',
    total_amount: 100000,
    net_amount: 80000,
    status: 'completed',
    pattern: 'shariah' as DistributionPattern,
    distribution_date: '2025-01-31',
    beneficiaries_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'dist-2',
    name: 'توزيع فبراير 2025',
    total_amount: 80000,
    net_amount: 64000,
    status: 'pending',
    pattern: 'equal' as DistributionPattern,
    distribution_date: '2025-02-28',
    beneficiaries_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==================== Distribution Details ====================
export const mockDistributionDetails = [
  {
    id: 'detail-1',
    distribution_id: 'dist-1',
    beneficiary_id: 'ben-1',
    beneficiary_name: 'محمد أحمد الوقفي',
    amount: 26666.67,
    share_percentage: 33.33,
    status: 'paid',
    payment_date: '2025-01-31',
  },
  {
    id: 'detail-2',
    distribution_id: 'dist-1',
    beneficiary_id: 'ben-2',
    beneficiary_name: 'أحمد محمد الوقفي',
    amount: 26666.67,
    share_percentage: 33.33,
    status: 'paid',
    payment_date: '2025-01-31',
  },
  {
    id: 'detail-3',
    distribution_id: 'dist-1',
    beneficiary_id: 'ben-3',
    beneficiary_name: 'فاطمة أحمد الوقفي',
    amount: 26666.66,
    share_percentage: 33.34,
    status: 'paid',
    payment_date: '2025-01-31',
  },
];

// ==================== Bank Transfers ====================
export const mockBankTransfers = [
  {
    id: 'transfer-1',
    file_number: 'TRF-2025-001',
    file_format: 'SARIE',
    status: 'completed',
    total_amount: 115000,
    total_transactions: 35,
    distribution_id: 'dist-1',
    bank_account_id: 'bank-1',
    bank_name: 'البنك الأهلي',
    created_at: new Date().toISOString(),
    generated_at: new Date().toISOString(),
    sent_at: new Date().toISOString(),
    processed_at: new Date().toISOString(),
  },
  {
    id: 'transfer-2',
    file_number: 'TRF-2025-002',
    file_format: 'SARIE',
    status: 'completed',
    total_amount: 80000,
    total_transactions: 30,
    distribution_id: 'dist-2',
    bank_account_id: 'bank-1',
    bank_name: 'البنك الأهلي',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    generated_at: new Date(Date.now() - 86400000).toISOString(),
    sent_at: new Date(Date.now() - 86400000).toISOString(),
    processed_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ==================== Bank Transfer Details ====================
export const mockBankTransferDetails = [
  {
    id: 'btd-1',
    transfer_file_id: 'transfer-1',
    beneficiary_id: 'ben-1',
    beneficiary_name: 'محمد أحمد الوقفي',
    iban: 'SA0380000000608010167519',
    bank_name: 'البنك الأهلي',
    amount: 26666.67,
    status: 'completed',
    reference_number: 'REF-001',
    processed_at: new Date().toISOString(),
  },
  {
    id: 'btd-2',
    transfer_file_id: 'transfer-1',
    beneficiary_id: 'ben-2',
    beneficiary_name: 'أحمد محمد الوقفي',
    iban: 'SA0380000000608010167520',
    bank_name: 'البنك الأهلي',
    amount: 26666.67,
    status: 'completed',
    reference_number: 'REF-002',
    processed_at: new Date().toISOString(),
  },
  {
    id: 'btd-3',
    transfer_file_id: 'transfer-1',
    beneficiary_id: 'ben-3',
    beneficiary_name: 'فاطمة أحمد الوقفي',
    iban: 'SA0380000000608010167521',
    bank_name: 'البنك الأهلي',
    amount: 26666.66,
    status: 'completed',
    reference_number: 'REF-003',
    processed_at: new Date().toISOString(),
  },
];

// ==================== Distribution Approvals ====================
export const mockDistributionApprovals = [
  {
    id: 'approval-1',
    distribution_id: 'dist-1',
    approver_id: 'user-1',
    approver_name: 'ناظر الوقف',
    status: 'approved',
    notes: 'تمت الموافقة على التوزيع',
    approved_at: new Date().toISOString(),
  },
];

// ==================== Heir Distributions ====================
export const mockHeirDistributions = [
  {
    id: 'hd-1',
    distribution_id: 'dist-1',
    beneficiary_id: 'ben-1',
    heir_type: 'son',
    share_percentage: 33.33,
    amount: 26666.67,
    status: 'completed',
  },
  {
    id: 'hd-2',
    distribution_id: 'dist-1',
    beneficiary_id: 'ben-2',
    heir_type: 'son',
    share_percentage: 33.33,
    amount: 26666.67,
    status: 'completed',
  },
  {
    id: 'hd-3',
    distribution_id: 'dist-1',
    beneficiary_id: 'ben-3',
    heir_type: 'daughter',
    share_percentage: 33.34,
    amount: 26666.66,
    status: 'completed',
  },
];

// ==================== Distribution Summary ====================
export const mockDistributionSummary = {
  total_distributions: 2,
  total_amount: 180000,
  total_beneficiaries: 3,
  average_per_beneficiary: 60000,
  by_status: {
    completed: 1,
    pending: 1,
    cancelled: 0,
  },
  by_pattern: {
    shariah: 1,
    equal: 1,
    need_based: 0,
    custom: 0,
  },
  monthly_data: [
    { month: '2025-01', amount: 100000, count: 1 },
    { month: '2025-02', amount: 80000, count: 1 },
  ],
};

// ==================== Simulation Result ====================
export const mockSimulationResult = {
  distributions: mockDistributions,
  beneficiaries: mockBeneficiaryDistributions,
  timestamp: new Date().toISOString(),
  summary: {
    total: 100000,
    net_distribution: 80000,
    deductions: {
      nazer: 10000,
      charity: 5000,
      development: 5000,
    },
  },
};

// ==================== Helper Functions ====================
export const createMockDistribution = (overrides: Record<string, unknown> = {}) => ({
  id: `dist-${Date.now()}`,
  name: 'توزيع جديد',
  total_amount: 100000,
  net_amount: 80000,
  status: 'pending',
  pattern: 'shariah' as DistributionPattern,
  distribution_date: new Date().toISOString().split('T')[0],
  beneficiaries_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockBankTransfer = (overrides: Record<string, unknown> = {}) => ({
  id: `transfer-${Date.now()}`,
  file_number: `TRF-${Date.now()}`,
  status: 'pending',
  total_amount: 0,
  total_transactions: 0,
  distribution_id: null,
  bank_name: 'البنك الأهلي',
  generated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockDistributionDetail = (overrides: Record<string, unknown> = {}) => ({
  id: `detail-${Date.now()}`,
  distribution_id: 'dist-1',
  beneficiary_id: 'ben-1',
  beneficiary_name: 'مستفيد',
  amount: 0,
  share_percentage: 0,
  status: 'pending',
  ...overrides,
});

export const createMockBeneficiaryDistribution = (overrides: Record<string, unknown> = {}) => ({
  id: `bd-${Date.now()}`,
  beneficiary_id: 'ben-1',
  beneficiary_name: 'مستفيد',
  amount: 0,
  share: 0,
  category: 'ذكر',
  relationship: 'ابن',
  ...overrides,
});

// ==================== Complete Fixtures Export ====================
export const distributionsFixtures = {
  distributions: mockDistributions,
  distributionDetails: mockDistributionDetails,
  bankTransfers: mockBankTransfers,
  bankTransferDetails: mockBankTransferDetails,
  settings: mockDistributionSettings,
  summary: mockDistributionSummary,
  simulationResult: mockSimulationResult,
  approvals: mockDistributionApprovals,
  heirDistributions: mockHeirDistributions,
  beneficiaryDistributions: mockBeneficiaryDistributions,
};
