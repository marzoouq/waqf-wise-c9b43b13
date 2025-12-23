/**
 * Distributions Fixtures - بيانات وهمية للتوزيعات
 * @version 1.0.0
 */

// ==================== Distribution Patterns ====================
export type DistributionPattern = 'equal' | 'shariah' | 'need_based' | 'custom';

// ==================== Distributions ====================
export const mockDistributions = [
  {
    id: 'dist-1',
    name: 'توزيع يناير 2024',
    description: 'التوزيع الشهري لشهر يناير',
    total_amount: 150000,
    distributed_amount: 145000,
    remaining_amount: 5000,
    beneficiaries_count: 50,
    pattern: 'shariah' as DistributionPattern,
    status: 'completed' as const,
    fiscal_year_id: 'fy-2024',
    created_at: new Date('2024-01-01').toISOString(),
    distributed_at: new Date('2024-01-15').toISOString(),
    created_by: 'user-admin',
  },
  {
    id: 'dist-2',
    name: 'توزيع فبراير 2024',
    description: 'التوزيع الشهري لشهر فبراير',
    total_amount: 160000,
    distributed_amount: 0,
    remaining_amount: 160000,
    beneficiaries_count: 52,
    pattern: 'equal' as DistributionPattern,
    status: 'pending' as const,
    fiscal_year_id: 'fy-2024',
    created_at: new Date('2024-02-01').toISOString(),
    distributed_at: null,
    created_by: 'user-admin',
  },
  {
    id: 'dist-3',
    name: 'توزيع طوارئ',
    description: 'توزيع مساعدات طارئة',
    total_amount: 50000,
    distributed_amount: 50000,
    remaining_amount: 0,
    beneficiaries_count: 15,
    pattern: 'need_based' as DistributionPattern,
    status: 'completed' as const,
    fiscal_year_id: 'fy-2024',
    created_at: new Date('2024-01-10').toISOString(),
    distributed_at: new Date('2024-01-11').toISOString(),
    created_by: 'user-nazer',
  },
];

// ==================== Distribution Details ====================
export const mockDistributionDetails = [
  {
    id: 'dd-1',
    distribution_id: 'dist-1',
    beneficiary_id: 'ben-1',
    beneficiary_name: 'محمد أحمد العلي',
    amount: 3000,
    share_percentage: 2,
    status: 'paid' as const,
    payment_method: 'bank_transfer',
    payment_date: new Date('2024-01-15').toISOString(),
    notes: '',
  },
  {
    id: 'dd-2',
    distribution_id: 'dist-1',
    beneficiary_id: 'ben-2',
    beneficiary_name: 'فاطمة محمد السعيد',
    amount: 2500,
    share_percentage: 1.67,
    status: 'paid' as const,
    payment_method: 'bank_transfer',
    payment_date: new Date('2024-01-15').toISOString(),
    notes: '',
  },
  {
    id: 'dd-3',
    distribution_id: 'dist-2',
    beneficiary_id: 'ben-1',
    beneficiary_name: 'محمد أحمد العلي',
    amount: 3100,
    share_percentage: 1.94,
    status: 'pending' as const,
    payment_method: null,
    payment_date: null,
    notes: 'في انتظار الموافقة',
  },
];

// ==================== Bank Transfers ====================
export const mockBankTransfers = [
  {
    id: 'bt-1',
    distribution_id: 'dist-1',
    file_number: 'TRF-2024-001',
    file_format: 'SARIE',
    total_amount: 145000,
    total_transactions: 50,
    status: 'completed' as const,
    bank_account_id: 'ba-1',
    created_at: new Date('2024-01-15').toISOString(),
    sent_at: new Date('2024-01-15').toISOString(),
    processed_at: new Date('2024-01-16').toISOString(),
  },
  {
    id: 'bt-2',
    distribution_id: 'dist-3',
    file_number: 'TRF-2024-002',
    file_format: 'SARIE',
    total_amount: 50000,
    total_transactions: 15,
    status: 'completed' as const,
    bank_account_id: 'ba-1',
    created_at: new Date('2024-01-11').toISOString(),
    sent_at: new Date('2024-01-11').toISOString(),
    processed_at: new Date('2024-01-12').toISOString(),
  },
];

// ==================== Bank Transfer Details ====================
export const mockBankTransferDetails = [
  {
    id: 'btd-1',
    transfer_file_id: 'bt-1',
    beneficiary_id: 'ben-1',
    beneficiary_name: 'محمد أحمد العلي',
    iban: 'SA0380000000608010167519',
    bank_name: 'البنك الأهلي',
    amount: 3000,
    status: 'completed' as const,
    reference_number: 'REF-001',
    processed_at: new Date('2024-01-16').toISOString(),
  },
  {
    id: 'btd-2',
    transfer_file_id: 'bt-1',
    beneficiary_id: 'ben-2',
    beneficiary_name: 'فاطمة محمد السعيد',
    iban: 'SA0380000000608010167520',
    bank_name: 'بنك الراجحي',
    amount: 2500,
    status: 'completed' as const,
    reference_number: 'REF-002',
    processed_at: new Date('2024-01-16').toISOString(),
  },
];

// ==================== Distribution Settings ====================
export const mockDistributionSettings = {
  id: 'ds-1',
  waqf_id: 'waqf-1',
  default_pattern: 'shariah' as DistributionPattern,
  auto_distribute: false,
  distribution_frequency: 'monthly' as const,
  minimum_amount: 100,
  deductions: {
    nazer_percentage: 10,
    charity_percentage: 5,
    development_percentage: 5,
  },
  approval_required: true,
  notification_enabled: true,
};

// ==================== Distribution Summary ====================
export const mockDistributionSummary = {
  total_distributions: 25,
  total_amount: 3500000,
  total_beneficiaries: 120,
  average_per_beneficiary: 29166.67,
  by_status: {
    completed: 20,
    pending: 3,
    cancelled: 2,
  },
  by_pattern: {
    shariah: 15,
    equal: 8,
    need_based: 2,
  },
  monthly_data: [
    { month: 'يناير', amount: 150000, count: 2 },
    { month: 'فبراير', amount: 160000, count: 2 },
    { month: 'مارس', amount: 155000, count: 2 },
  ],
};

// ==================== Distribution Simulation ====================
export const mockSimulationResult = {
  pattern: 'shariah' as DistributionPattern,
  total_amount: 100000,
  beneficiaries: [
    { id: 'ben-1', name: 'محمد أحمد', amount: 20000, share: 20 },
    { id: 'ben-2', name: 'فاطمة محمد', amount: 15000, share: 15 },
    { id: 'ben-3', name: 'علي حسن', amount: 18000, share: 18 },
  ],
  summary: {
    total: 100000,
    deductions: {
      nazer: 10000,
      charity: 5000,
      development: 5000,
    },
    net_distribution: 80000,
  },
  timestamp: new Date().toISOString(),
};

// ==================== Distribution Approvals ====================
export const mockDistributionApprovals = [
  {
    id: 'da-1',
    distribution_id: 'dist-2',
    approver_id: 'user-nazer',
    approver_name: 'ناظر الوقف',
    status: 'pending' as const,
    level: 1,
    created_at: new Date('2024-02-01').toISOString(),
    notes: '',
  },
  {
    id: 'da-2',
    distribution_id: 'dist-1',
    approver_id: 'user-nazer',
    approver_name: 'ناظر الوقف',
    status: 'approved' as const,
    level: 1,
    created_at: new Date('2024-01-14').toISOString(),
    approved_at: new Date('2024-01-14').toISOString(),
    notes: 'تمت الموافقة',
  },
];

// ==================== Heir Distributions ====================
export const mockHeirDistributions = [
  {
    id: 'hd-1',
    beneficiary_id: 'ben-1',
    fiscal_year_id: 'fy-2024',
    total_amount: 36000,
    paid_amount: 36000,
    pending_amount: 0,
    distributions: [
      { month: 1, amount: 3000, status: 'paid' },
      { month: 2, amount: 3000, status: 'paid' },
      { month: 3, amount: 3000, status: 'paid' },
    ],
  },
];

// ==================== Helper Functions ====================
export const createMockDistribution = (overrides: Partial<typeof mockDistributions[0]> = {}) => ({
  id: `dist-${Date.now()}`,
  name: 'توزيع اختباري',
  description: 'وصف التوزيع الاختباري',
  total_amount: 100000,
  distributed_amount: 0,
  remaining_amount: 100000,
  beneficiaries_count: 30,
  pattern: 'equal' as DistributionPattern,
  status: 'pending' as const,
  fiscal_year_id: 'fy-2024',
  created_at: new Date().toISOString(),
  distributed_at: null,
  created_by: 'user-admin',
  ...overrides,
});

export const createMockBankTransfer = (overrides: Partial<typeof mockBankTransfers[0]> = {}) => ({
  id: `bt-${Date.now()}`,
  distribution_id: 'dist-1',
  file_number: `TRF-${Date.now()}`,
  file_format: 'SARIE',
  total_amount: 100000,
  total_transactions: 30,
  status: 'pending' as const,
  bank_account_id: 'ba-1',
  created_at: new Date().toISOString(),
  sent_at: null,
  processed_at: null,
  ...overrides,
});

export const createMockDistributionDetail = (overrides: Partial<typeof mockDistributionDetails[0]> = {}) => ({
  id: `dd-${Date.now()}`,
  distribution_id: 'dist-1',
  beneficiary_id: 'ben-1',
  beneficiary_name: 'مستفيد اختباري',
  amount: 3000,
  share_percentage: 10,
  status: 'pending' as const,
  payment_method: null,
  payment_date: null,
  notes: '',
  ...overrides,
});

// ==================== Export All ====================
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
};
