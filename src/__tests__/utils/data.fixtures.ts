/**
 * بيانات اختبار ثابتة (Fixtures)
 * Test Data Fixtures
 */

// ==================== المستفيدين ====================
export const mockBeneficiary = {
  id: 'ben-1',
  full_name: 'محمد أحمد الوقفي',
  national_id: '1234567890',
  phone: '0501234567',
  email: 'mohamed@waqf.sa',
  status: 'active',
  category: 'ذكر',
  total_received: 50000,
  account_balance: 10000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockBeneficiaries = [
  mockBeneficiary,
  {
    id: 'ben-2',
    full_name: 'أحمد محمد الوقفي',
    national_id: '0987654321',
    phone: '0509876543',
    email: 'ahmed@waqf.sa',
    status: 'active',
    category: 'ذكر',
    total_received: 30000,
    account_balance: 5000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ben-3',
    full_name: 'فاطمة أحمد الوقفي',
    national_id: '1122334455',
    phone: '0551122334',
    email: 'fatima@waqf.sa',
    status: 'active',
    category: 'أنثى',
    total_received: 25000,
    account_balance: 8000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==================== العقارات ====================
export const mockProperty = {
  id: 'prop-1',
  name: 'عمارة الرياض السكنية',
  location: 'الرياض - حي النخيل',
  property_type: 'سكني',
  status: 'active',
  monthly_rent: 50000,
  total_units: 10,
  occupied_units: 8,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockProperties = [
  mockProperty,
  {
    id: 'prop-2',
    name: 'مجمع جدة التجاري',
    location: 'جدة - حي الحمراء',
    property_type: 'تجاري',
    status: 'active',
    monthly_rent: 120000,
    total_units: 20,
    occupied_units: 18,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==================== العقود ====================
export const mockContract = {
  id: 'contract-1',
  property_id: 'prop-1',
  unit_id: 'unit-1',
  tenant_id: 'tenant-1',
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  monthly_rent: 5000,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockContracts = [
  mockContract,
  {
    id: 'contract-2',
    property_id: 'prop-2',
    unit_id: 'unit-5',
    tenant_id: 'tenant-2',
    start_date: '2025-02-01',
    end_date: '2026-01-31',
    monthly_rent: 8000,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==================== المدفوعات ====================
export const mockPayment = {
  id: 'pay-1',
  amount: 50000,
  payment_date: '2025-01-15',
  payment_type: 'إيجار',
  status: 'completed',
  reference_number: 'PAY-001',
  created_at: new Date().toISOString(),
};

export const mockPayments = [
  mockPayment,
  {
    id: 'pay-2',
    amount: 30000,
    payment_date: '2025-01-20',
    payment_type: 'توزيع',
    status: 'completed',
    reference_number: 'PAY-002',
    created_at: new Date().toISOString(),
  },
];

// ==================== القيود المحاسبية ====================
export const mockJournalEntry = {
  id: 'je-1',
  entry_number: 'JE-2025-001',
  entry_date: '2025-01-15',
  description: 'قيد إيرادات إيجارية',
  status: 'posted',
  total_debit: 50000,
  total_credit: 50000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockJournalEntries = [
  mockJournalEntry,
  {
    id: 'je-2',
    entry_number: 'JE-2025-002',
    entry_date: '2025-01-20',
    description: 'قيد مصروفات صيانة',
    status: 'posted',
    total_debit: 10000,
    total_credit: 10000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==================== الحسابات ====================
export const mockAccount = {
  id: 'acc-1',
  code: '1.1.1',
  name_ar: 'الصندوق',
  name_en: 'Cash',
  account_type: 'asset' as const,
  account_nature: 'debit' as const,
  is_header: false,
  is_active: true,
  current_balance: 100000,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockAccounts = [
  mockAccount,
  {
    id: 'acc-2',
    code: '1.1.2',
    name_ar: 'البنك',
    name_en: 'Bank',
    account_type: 'asset' as const,
    account_nature: 'debit' as const,
    is_header: false,
    is_active: true,
    current_balance: 500000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-3',
    code: '4.1.1',
    name_ar: 'إيرادات الإيجارات',
    name_en: 'Rental Revenue',
    account_type: 'revenue' as const,
    account_nature: 'credit' as const,
    is_header: false,
    is_active: true,
    current_balance: 850000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'acc-4',
    code: '5.1.1',
    name_ar: 'مصروفات الصيانة',
    name_en: 'Maintenance Expenses',
    account_type: 'expense' as const,
    account_nature: 'debit' as const,
    is_header: false,
    is_active: true,
    current_balance: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==================== التوزيعات ====================
export const mockDistribution = {
  id: 'dist-1',
  name: 'توزيع الربع الأول 2025',
  total_amount: 100000,
  status: 'completed',
  pattern: 'shariah',
  distribution_date: '2025-01-31',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockDistributions = [
  mockDistribution,
  {
    id: 'dist-2',
    name: 'توزيع فبراير 2025',
    total_amount: 80000,
    status: 'pending',
    pattern: 'equal',
    distribution_date: '2025-02-28',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==================== السنوات المالية ====================
export const mockFiscalYear = {
  id: 'fy-1',
  name: '2025-2026',
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  is_active: true,
  is_closed: false,
  is_published: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockFiscalYears = [
  mockFiscalYear,
  {
    id: 'fy-2',
    name: '2024-2025',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    is_active: false,
    is_closed: true,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// ==================== المستخدمين ====================
export const mockUser = {
  id: 'user-1',
  email: 'admin@waqf.sa',
  full_name: 'مدير النظام',
  role: 'admin',
  is_active: true,
  created_at: new Date().toISOString(),
};

export const mockUserRoles = [
  { user_id: 'user-1', role: 'admin' },
  { user_id: 'user-2', role: 'accountant' },
  { user_id: 'user-3', role: 'nazer' },
];

// ==================== الأدوار ====================
export const mockRoles = ['admin', 'nazer', 'accountant', 'cashier', 'archivist', 'beneficiary'];

// ==================== الإعدادات ====================
export const mockOrganizationSettings = {
  waqf_name: 'وقف اختباري',
  waqf_logo: null,
  address: 'الرياض، المملكة العربية السعودية',
  phone: '0112345678',
  email: 'info@waqf.sa',
  cr_number: '1234567890',
  vat_number: '300000000000003',
};

// ==================== دوال مساعدة ====================
export const createMockBeneficiary = (overrides = {}) => ({
  id: `ben-${Date.now()}`,
  full_name: 'مستفيد جديد',
  national_id: '1234567890',
  phone: '0501234567',
  status: 'active',
  category: 'ذكر',
  total_received: 0,
  account_balance: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockProperty = (overrides = {}) => ({
  id: `prop-${Date.now()}`,
  name: 'عقار جديد',
  location: 'الرياض',
  property_type: 'سكني',
  status: 'active',
  monthly_rent: 10000,
  total_units: 5,
  occupied_units: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockContract = (overrides = {}) => ({
  id: `contract-${Date.now()}`,
  property_id: 'prop-1',
  unit_id: 'unit-1',
  tenant_id: 'tenant-1',
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  monthly_rent: 5000,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockPayment = (overrides = {}) => ({
  id: `pay-${Date.now()}`,
  amount: 10000,
  payment_date: new Date().toISOString().split('T')[0],
  payment_type: 'إيجار',
  status: 'completed',
  reference_number: `PAY-${Date.now()}`,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockJournalEntry = (overrides = {}) => ({
  id: `je-${Date.now()}`,
  entry_number: `JE-${Date.now()}`,
  entry_date: new Date().toISOString().split('T')[0],
  description: 'قيد جديد',
  status: 'draft',
  total_debit: 0,
  total_credit: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockAccount = (overrides = {}) => ({
  id: `acc-${Date.now()}`,
  code: '1.1.99',
  name_ar: 'حساب جديد',
  name_en: 'New Account',
  account_type: 'asset' as const,
  account_nature: 'debit' as const,
  is_header: false,
  is_active: true,
  current_balance: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockDistribution = (overrides = {}) => ({
  id: `dist-${Date.now()}`,
  name: 'توزيع جديد',
  total_amount: 100000,
  status: 'pending',
  pattern: 'shariah',
  distribution_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

// ==================== Notifications ====================
export const mockNotifications = [
  {
    id: 'notif-1',
    title: 'إشعار جديد',
    body: 'محتوى الإشعار',
    type: 'info',
    is_read: false,
    user_id: 'user-1',
    created_at: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    title: 'تنبيه مهم',
    body: 'يرجى الانتباه',
    type: 'warning',
    is_read: true,
    user_id: 'user-1',
    created_at: new Date().toISOString(),
  },
];

// ==================== Documents ====================
export const mockDocuments = [
  {
    id: 'doc-1',
    name: 'عقد إيجار',
    file_name: 'contract.pdf',
    file_path: 'documents/contract.pdf',
    file_type: 'عقد',
    file_size: 1024000,
    created_at: new Date().toISOString(),
  },
  {
    id: 'doc-2',
    name: 'صك ملكية',
    file_name: 'deed.pdf',
    file_path: 'documents/deed.pdf',
    file_type: 'صك',
    file_size: 2048000,
    created_at: new Date().toISOString(),
  },
];

// ==================== Tenants ====================
export const mockTenants = [
  {
    id: 'tenant-1',
    name: 'شركة روائع التجارية',
    contact_name: 'أحمد محمد',
    contact_phone: '0501234567',
    contact_email: 'ahmed@company.sa',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'tenant-2',
    name: 'مؤسسة النور',
    contact_name: 'محمد أحمد',
    contact_phone: '0509876543',
    contact_email: 'mohamed@alnoor.sa',
    status: 'active',
    created_at: new Date().toISOString(),
  },
];

// ==================== Loans ====================
export const mockLoans = [
  {
    id: 'loan-1',
    beneficiary_id: 'ben-1',
    amount: 50000,
    remaining_amount: 40000,
    term_months: 12,
    status: 'active',
    start_date: '2025-01-01',
    created_at: new Date().toISOString(),
  },
  {
    id: 'loan-2',
    beneficiary_id: 'ben-2',
    amount: 30000,
    remaining_amount: 0,
    term_months: 6,
    status: 'completed',
    start_date: '2024-06-01',
    created_at: new Date().toISOString(),
  },
];

// ==================== Funds ====================
export const mockFunds = [
  {
    id: 'fund-1',
    name: 'صندوق الطوارئ',
    fund_type: 'emergency',
    target_amount: 500000,
    current_amount: 350000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'fund-2',
    name: 'صندوق التطوير',
    fund_type: 'development',
    target_amount: 1000000,
    current_amount: 200000,
    status: 'active',
    created_at: new Date().toISOString(),
  },
];
