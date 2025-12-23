/**
 * Funds Test Fixtures - بيانات اختبار الصناديق
 * @version 1.0.0
 */

export const mockFunds = [
  {
    id: 'fund-1',
    name: 'صندوق الطوارئ',
    code: 'EMERGENCY',
    description: 'صندوق مخصص للحالات الطارئة والمساعدات العاجلة',
    fund_type: 'emergency',
    target_balance: 500000,
    current_balance: 350000,
    minimum_balance: 100000,
    is_active: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
    created_by: 'admin-1',
  },
  {
    id: 'fund-2',
    name: 'صندوق التطوير',
    code: 'DEVELOPMENT',
    description: 'صندوق لتطوير العقارات والاستثمارات',
    fund_type: 'development',
    target_balance: 1000000,
    current_balance: 750000,
    minimum_balance: 200000,
    is_active: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
    created_by: 'admin-1',
  },
  {
    id: 'fund-3',
    name: 'صندوق الصيانة',
    code: 'MAINTENANCE',
    description: 'صندوق مخصص لصيانة العقارات',
    fund_type: 'maintenance',
    target_balance: 300000,
    current_balance: 280000,
    minimum_balance: 50000,
    is_active: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
    created_by: 'admin-1',
  },
  {
    id: 'fund-4',
    name: 'صندوق الخير',
    code: 'CHARITY',
    description: 'صندوق للأعمال الخيرية والصدقات',
    fund_type: 'charity',
    target_balance: 200000,
    current_balance: 175000,
    minimum_balance: 25000,
    is_active: true,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
    created_by: 'admin-1',
  },
];

export const mockFundTransactions = [
  {
    id: 'ftx-1',
    fund_id: 'fund-1',
    transaction_type: 'deposit',
    amount: 50000,
    description: 'تحويل شهري للصندوق',
    reference_number: 'FTX-2024-001',
    created_at: '2024-06-01T10:00:00Z',
    created_by: 'accountant-1',
    balance_after: 350000,
  },
  {
    id: 'ftx-2',
    fund_id: 'fund-1',
    transaction_type: 'withdrawal',
    amount: 25000,
    description: 'مساعدة طارئة للمستفيد محمد',
    reference_number: 'FTX-2024-002',
    created_at: '2024-06-05T10:00:00Z',
    created_by: 'accountant-1',
    balance_after: 325000,
  },
  {
    id: 'ftx-3',
    fund_id: 'fund-2',
    transaction_type: 'deposit',
    amount: 100000,
    description: 'تخصيص سنوي للتطوير',
    reference_number: 'FTX-2024-003',
    created_at: '2024-01-15T10:00:00Z',
    created_by: 'accountant-1',
    balance_after: 750000,
  },
];

export const mockFundAllocations = [
  {
    id: 'alloc-1',
    fund_id: 'fund-1',
    source: 'distributions',
    percentage: 5,
    is_automatic: true,
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'alloc-2',
    fund_id: 'fund-2',
    source: 'distributions',
    percentage: 10,
    is_automatic: true,
    created_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'alloc-3',
    fund_id: 'fund-3',
    source: 'rental_income',
    percentage: 3,
    is_automatic: true,
    created_at: '2024-01-01T10:00:00Z',
  },
];

export const mockFundStats = {
  total_funds: 4,
  total_balance: 1555000,
  total_target: 2000000,
  funds_below_minimum: 0,
  funds_at_target: 1,
  monthly_allocations: 125000,
  monthly_withdrawals: 45000,
};

export const fundFilters = {
  activeOnly: { isActive: true },
  byType: { fundType: 'emergency' },
  belowMinimum: { belowMinimum: true },
  atTarget: { atTarget: true },
};

export const mockFundTypes = [
  { id: 'emergency', name: 'طوارئ', icon: 'AlertTriangle', color: 'red' },
  { id: 'development', name: 'تطوير', icon: 'TrendingUp', color: 'blue' },
  { id: 'maintenance', name: 'صيانة', icon: 'Wrench', color: 'orange' },
  { id: 'charity', name: 'خير', icon: 'Heart', color: 'green' },
  { id: 'reserve', name: 'احتياطي', icon: 'Shield', color: 'purple' },
];
