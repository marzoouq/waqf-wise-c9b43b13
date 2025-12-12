/**
 * بيانات اختبار ثابتة (Fixtures)
 * تمثل بيانات حقيقية للاختبارات
 */

// ==================== المستفيدين ====================
export const mockBeneficiary = {
  id: 'ben-001',
  full_name: 'محمد أحمد الثبيتي',
  national_id: '1234567890',
  phone: '0501234567',
  email: 'mohamed@example.com',
  category: 'ابن',
  status: 'نشط',
  gender: 'ذكر',
  date_of_birth: '1990-01-15',
  city: 'الطائف',
  tribe: 'الثبيتي',
  iban: 'SA1234567890123456789012',
  bank_name: 'البنك الأهلي',
  account_balance: 5000,
  total_received: 25000,
  total_payments: 3,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-12-01T00:00:00Z',
};

export const mockBeneficiaries = [
  mockBeneficiary,
  {
    ...mockBeneficiary,
    id: 'ben-002',
    full_name: 'فاطمة محمد الثبيتي',
    national_id: '0987654321',
    category: 'بنت',
    gender: 'أنثى',
  },
  {
    ...mockBeneficiary,
    id: 'ben-003',
    full_name: 'أحمد عبدالله الثبيتي',
    national_id: '1122334455',
    category: 'ابن',
  },
];

// ==================== العقارات ====================
export const mockProperty = {
  id: 'prop-001',
  name: 'عقار الطائف 1',
  property_type: 'سكني تجاري',
  location: 'الطائف',
  address: 'حي السامر، شارع الملك فهد',
  total_units: 8,
  monthly_rent: 0,
  status: 'نشط',
  description: 'عمارة سكنية تجارية من 4 طوابق',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-12-01T00:00:00Z',
};

export const mockProperties = [
  mockProperty,
  {
    ...mockProperty,
    id: 'prop-002',
    name: 'عقار الطائف 2',
    total_units: 9,
  },
];

// ==================== العقود ====================
export const mockContract = {
  id: 'cont-001',
  contract_number: 'CNT-2024-001',
  property_id: 'prop-001',
  tenant_id: 'ten-001',
  tenant_name: 'شركة القويشي',
  start_date: '2024-01-01',
  end_date: '2025-01-01',
  monthly_rent: 29166.67,
  annual_rent: 350000,
  payment_frequency: 'سنوي',
  status: 'نشط',
  contract_type: 'إيجار تجاري',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-12-01T00:00:00Z',
};

export const mockContracts = [
  mockContract,
  {
    ...mockContract,
    id: 'cont-002',
    contract_number: 'CNT-2024-002',
    tenant_name: 'مؤسسة رواء',
    monthly_rent: 33333.33,
    annual_rent: 400000,
  },
];

// ==================== المدفوعات ====================
export const mockPayment = {
  id: 'pay-001',
  payment_number: 'PAY-2024-001',
  amount: 350000,
  payment_type: 'إيجار',
  payment_method: 'تحويل بنكي',
  payment_date: '2024-11-01',
  payer_name: 'شركة القويشي',
  description: 'دفعة إيجار سنوية',
  status: 'مدفوع',
  beneficiary_id: null,
  created_at: '2024-11-01T00:00:00Z',
};

export const mockPayments = [
  mockPayment,
  {
    ...mockPayment,
    id: 'pay-002',
    payment_number: 'PAY-2024-002',
    amount: 400000,
    payer_name: 'مؤسسة رواء',
    payment_date: '2024-10-15',
  },
];

// ==================== القيود المحاسبية ====================
export const mockJournalEntry = {
  id: 'je-001',
  entry_number: 'JE-2024-001',
  entry_date: '2024-11-01',
  description: 'تسجيل إيرادات إيجار القويشي',
  total_debit: 350000,
  total_credit: 350000,
  status: 'مرحل',
  posted_at: '2024-11-01T10:00:00Z',
  created_by: 'user-001',
  created_at: '2024-11-01T00:00:00Z',
};

export const mockJournalEntries = [
  mockJournalEntry,
  {
    ...mockJournalEntry,
    id: 'je-002',
    entry_number: 'JE-2024-002',
    description: 'تسجيل إيرادات إيجار رواء',
    total_debit: 400000,
    total_credit: 400000,
    entry_date: '2024-10-15',
  },
];

// ==================== الحسابات ====================
export const mockAccount = {
  id: 'acc-001',
  code: '1.1.1',
  name_ar: 'البنك',
  name_en: 'Bank',
  account_type: 'asset',
  account_nature: 'debit',
  current_balance: 850000,
  is_active: true,
  is_header: false,
  parent_id: null,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockAccounts = [
  mockAccount,
  {
    ...mockAccount,
    id: 'acc-002',
    code: '4.1.1',
    name_ar: 'إيرادات الإيجار',
    name_en: 'Rental Revenue',
    account_type: 'revenue',
    account_nature: 'credit',
    current_balance: 750000,
  },
  {
    ...mockAccount,
    id: 'acc-003',
    code: '2.1.1',
    name_ar: 'ضريبة القيمة المضافة',
    name_en: 'VAT Payable',
    account_type: 'liability',
    account_nature: 'credit',
    current_balance: 92912.93,
  },
];

// ==================== التوزيعات ====================
export const mockDistribution = {
  id: 'dist-001',
  month: '2024-11',
  distribution_date: '2024-11-15',
  total_amount: 100000,
  beneficiaries_count: 14,
  status: 'معتمد',
  fiscal_year_id: 'fy-2024',
  created_by: 'user-001',
  created_at: '2024-11-01T00:00:00Z',
};

export const mockDistributions = [mockDistribution];

// ==================== السنوات المالية ====================
export const mockFiscalYear = {
  id: 'fy-2025',
  year_name: '2025-2026',
  start_date: '2025-10-25',
  end_date: '2026-10-24',
  is_closed: false,
  is_active: true,
  total_revenues: 850000,
  total_expenses: 0,
  created_at: '2025-10-25T00:00:00Z',
};

export const mockFiscalYears = [
  mockFiscalYear,
  {
    ...mockFiscalYear,
    id: 'fy-2024',
    year_name: '2024-2025',
    start_date: '2024-10-25',
    end_date: '2025-10-24',
    is_closed: true,
    is_active: false,
    total_revenues: 1490380,
    total_expenses: 125239.85,
  },
];

// ==================== المستخدمين ====================
export const mockUser = {
  id: 'user-001',
  email: 'admin@waqf.sa',
  created_at: '2024-01-01T00:00:00Z',
  last_sign_in_at: '2024-12-01T00:00:00Z',
};

export const mockUserRoles = [
  { user_id: 'user-001', role: 'admin' },
  { user_id: 'user-001', role: 'nazer' },
];

// ==================== الأدوار والصلاحيات ====================
export const mockRoles = [
  'admin',
  'nazer',
  'accountant',
  'cashier',
  'archivist',
  'beneficiary',
  'waqf_heir',
  'user',
] as const;

// ==================== الإعدادات ====================
export const mockOrganizationSettings = {
  organization_name: 'وقف مرزوق الثبيتي',
  organization_name_en: 'Marzouq Al-Thubaiti Waqf',
  address: 'المملكة العربية السعودية - الطائف',
  phone: '0127123456',
  email: 'info@waqf.sa',
  vat_number: '300123456789003',
  commercial_registration: '1234567890',
  logo_url: null,
};

// ==================== دوال مساعدة ====================

// إنشاء مستفيد عشوائي
export const createMockBeneficiary = (overrides = {}) => ({
  ...mockBeneficiary,
  id: `ben-${Math.random().toString(36).substr(2, 9)}`,
  ...overrides,
});

// إنشاء عقار عشوائي
export const createMockProperty = (overrides = {}) => ({
  ...mockProperty,
  id: `prop-${Math.random().toString(36).substr(2, 9)}`,
  ...overrides,
});

// إنشاء عقد عشوائي
export const createMockContract = (overrides = {}) => ({
  ...mockContract,
  id: `cont-${Math.random().toString(36).substr(2, 9)}`,
  ...overrides,
});

// إنشاء دفعة عشوائية
export const createMockPayment = (overrides = {}) => ({
  ...mockPayment,
  id: `pay-${Math.random().toString(36).substr(2, 9)}`,
  ...overrides,
});

// إنشاء قيد محاسبي عشوائي
export const createMockJournalEntry = (overrides = {}) => ({
  ...mockJournalEntry,
  id: `je-${Math.random().toString(36).substr(2, 9)}`,
  ...overrides,
});
