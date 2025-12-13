/**
 * بيانات اختبار المالية الحقيقية
 * Real Financial Test Fixtures
 * مطابقة للبيانات الفعلية في قاعدة البيانات
 */

// الحسابات المحاسبية
export const realAccounts = [
  {
    id: 'acc-bank',
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
  },
  {
    id: 'acc-receivables',
    code: '1.2.1',
    name_ar: 'ذمم المستأجرين',
    name_en: 'Tenants Receivables',
    account_type: 'asset',
    account_nature: 'debit',
    current_balance: 0,
    is_active: true,
    is_header: false,
    parent_id: null,
  },
  {
    id: 'acc-rental-revenue',
    code: '4.1.1',
    name_ar: 'إيرادات الإيجار',
    name_en: 'Rental Revenue',
    account_type: 'revenue',
    account_nature: 'credit',
    current_balance: 750000,
    is_active: true,
    is_header: false,
    parent_id: null,
  },
  {
    id: 'acc-vat-payable',
    code: '2.1.1',
    name_ar: 'ضريبة القيمة المضافة',
    name_en: 'VAT Payable',
    account_type: 'liability',
    account_nature: 'credit',
    current_balance: 92912.93,
    is_active: true,
    is_header: false,
    parent_id: null,
  },
  {
    id: 'acc-waqf-corpus',
    code: '3.1.1',
    name_ar: 'رقبة الوقف',
    name_en: 'Waqf Corpus',
    account_type: 'equity',
    account_nature: 'credit',
    current_balance: 107913.20,
    is_active: true,
    is_header: false,
    parent_id: null,
  },
  {
    id: 'acc-nazer-share',
    code: '5.1.1',
    name_ar: 'حصة الناظر',
    name_en: 'Nazer Share',
    account_type: 'expense',
    account_nature: 'debit',
    current_balance: 0,
    is_active: true,
    is_header: false,
    parent_id: null,
  },
  {
    id: 'acc-beneficiary-dist',
    code: '5.2.1',
    name_ar: 'توزيعات المستفيدين',
    name_en: 'Beneficiary Distributions',
    account_type: 'expense',
    account_nature: 'debit',
    current_balance: 0,
    is_active: true,
    is_header: false,
    parent_id: null,
  },
];

// المدفوعات الحقيقية
export const realPayments = [
  {
    id: 'pay-001',
    payment_number: 'PAY-2024-001',
    amount: 350000,
    payment_type: 'إيجار',
    payment_method: 'تحويل بنكي',
    payment_date: '2024-11-01',
    payer_name: 'شركة القويشي للتجارة',
    description: 'دفعة إيجار سنوية - عقار السامر 2',
    status: 'مدفوع',
    tax_amount: 52500,
    net_amount: 297500,
    beneficiary_id: null,
    contract_id: 'cont-001',
    created_at: '2024-11-01T00:00:00Z',
  },
  {
    id: 'pay-002',
    payment_number: 'PAY-2024-002',
    amount: 400000,
    payment_type: 'إيجار',
    payment_method: 'تحويل بنكي',
    payment_date: '2024-10-15',
    payer_name: 'مؤسسة رواء للخدمات',
    description: 'دفعة إيجار سنوية - عقار السامر 3',
    status: 'مدفوع',
    tax_amount: 60000,
    net_amount: 340000,
    beneficiary_id: null,
    contract_id: 'cont-002',
    created_at: '2024-10-15T00:00:00Z',
  },
  {
    id: 'pay-003',
    payment_number: 'PAY-2024-003',
    amount: 100000,
    payment_type: 'إيجار',
    payment_method: 'تحويل بنكي',
    payment_date: '2024-12-01',
    payer_name: 'الثبيتي للاستثمار',
    description: 'دفعة إيجار سنوية مقدمة',
    status: 'مدفوع',
    tax_amount: 15000,
    net_amount: 85000,
    beneficiary_id: null,
    contract_id: 'cont-003',
    created_at: '2024-12-01T00:00:00Z',
  },
];

// القيود المحاسبية
export const realJournalEntries = [
  {
    id: 'je-001',
    entry_number: 'JE-2024-001',
    entry_date: '2024-11-01',
    description: 'تسجيل إيرادات إيجار القويشي',
    total_debit: 350000,
    total_credit: 350000,
    status: 'مرحل',
    posted_at: '2024-11-01T10:00:00Z',
    fiscal_year_id: 'fy-2025',
    created_by: 'user-001',
    created_at: '2024-11-01T00:00:00Z',
  },
  {
    id: 'je-002',
    entry_number: 'JE-2024-002',
    entry_date: '2024-10-15',
    description: 'تسجيل إيرادات إيجار رواء',
    total_debit: 400000,
    total_credit: 400000,
    status: 'مرحل',
    posted_at: '2024-10-15T10:00:00Z',
    fiscal_year_id: 'fy-2025',
    created_by: 'user-001',
    created_at: '2024-10-15T00:00:00Z',
  },
  {
    id: 'je-003',
    entry_number: 'JE-2024-003',
    entry_date: '2024-12-01',
    description: 'تسجيل إيرادات إيجار الثبيتي',
    total_debit: 100000,
    total_credit: 100000,
    status: 'مرحل',
    posted_at: '2024-12-01T10:00:00Z',
    fiscal_year_id: 'fy-2025',
    created_by: 'user-001',
    created_at: '2024-12-01T00:00:00Z',
  },
];

// سطور القيود
export const realJournalEntryLines = [
  // قيد القويشي - مدين
  {
    id: 'jel-001-1',
    journal_entry_id: 'je-001',
    account_id: 'acc-bank',
    debit: 350000,
    credit: 0,
    description: 'استلام إيجار القويشي',
  },
  // قيد القويشي - دائن (إيرادات)
  {
    id: 'jel-001-2',
    journal_entry_id: 'je-001',
    account_id: 'acc-rental-revenue',
    debit: 0,
    credit: 297500,
    description: 'إيرادات الإيجار بعد الضريبة',
  },
  // قيد القويشي - دائن (ضريبة)
  {
    id: 'jel-001-3',
    journal_entry_id: 'je-001',
    account_id: 'acc-vat-payable',
    debit: 0,
    credit: 52500,
    description: 'ضريبة القيمة المضافة 15%',
  },
  // قيد رواء - مدين
  {
    id: 'jel-002-1',
    journal_entry_id: 'je-002',
    account_id: 'acc-bank',
    debit: 400000,
    credit: 0,
    description: 'استلام إيجار رواء',
  },
  // قيد رواء - دائن (إيرادات)
  {
    id: 'jel-002-2',
    journal_entry_id: 'je-002',
    account_id: 'acc-rental-revenue',
    debit: 0,
    credit: 340000,
    description: 'إيرادات الإيجار بعد الضريبة',
  },
  // قيد رواء - دائن (ضريبة)
  {
    id: 'jel-002-3',
    journal_entry_id: 'je-002',
    account_id: 'acc-vat-payable',
    debit: 0,
    credit: 60000,
    description: 'ضريبة القيمة المضافة 15%',
  },
];

// السنوات المالية
export const realFiscalYears = [
  {
    id: 'fy-2025',
    year_name: '2025-2026',
    start_date: '2025-10-25',
    end_date: '2026-10-24',
    is_closed: false,
    is_active: true,
    is_published: false,
    total_revenues: 850000,
    total_expenses: 0,
    net_income: 850000,
    waqf_corpus_amount: 0,
    nazer_share_amount: 0,
    charity_share_amount: 0,
    created_at: '2025-10-25T00:00:00Z',
  },
  {
    id: 'fy-2024',
    year_name: '2024-2025',
    start_date: '2024-10-25',
    end_date: '2025-10-24',
    is_closed: true,
    is_active: false,
    is_published: true,
    total_revenues: 1490380,
    total_expenses: 125239.85,
    net_income: 1365140.15,
    waqf_corpus_amount: 107913.20,
    nazer_share_amount: 136514.02,
    charity_share_amount: 68257.01,
    created_at: '2024-10-25T00:00:00Z',
  },
];

// التوزيعات
export const realDistributions = [
  {
    id: 'dist-001',
    distribution_number: 'DIST-2024-001',
    distribution_date: '2024-11-15',
    fiscal_year_id: 'fy-2024',
    total_amount: 1000000,
    beneficiaries_count: 14,
    status: 'معتمد',
    approved_by: 'user-001',
    approved_at: '2024-11-15T10:00:00Z',
    created_by: 'user-001',
    created_at: '2024-11-01T00:00:00Z',
  },
];

// تفاصيل التوزيعات للورثة
export const realHeirDistributions = [
  {
    id: 'heir-dist-001',
    distribution_id: 'dist-001',
    beneficiary_id: 'ben-001',
    heir_type: 'ابن',
    amount: 71428.57,
    status: 'مدفوع',
    payment_date: '2024-11-20',
  },
  {
    id: 'heir-dist-002',
    distribution_id: 'dist-001',
    beneficiary_id: 'ben-002',
    heir_type: 'ابن',
    amount: 71428.57,
    status: 'مدفوع',
    payment_date: '2024-11-20',
  },
  {
    id: 'heir-dist-003',
    distribution_id: 'dist-001',
    beneficiary_id: 'ben-003',
    heir_type: 'بنت',
    amount: 71428.57,
    status: 'مدفوع',
    payment_date: '2024-11-20',
  },
];

// إحصائيات مالية محسوبة
export const financialStats = {
  bankBalance: 850000,
  waqfCorpus: 107913.20,
  totalCollectedRent: realPayments.reduce((sum, p) => sum + p.amount, 0),
  totalVAT: realPayments.reduce((sum, p) => sum + p.tax_amount, 0),
  totalNetRevenue: realPayments.reduce((sum, p) => sum + p.net_amount, 0),
  totalDistributed: realDistributions.reduce((sum, d) => sum + d.total_amount, 0),
};

// Helper functions
export const getAccountByCode = (code: string) => 
  realAccounts.find(a => a.code === code);

export const getActivePayments = () => 
  realPayments.filter(p => p.status === 'مدفوع');

export const getJournalEntriesByFiscalYear = (fiscalYearId: string) => 
  realJournalEntries.filter(je => je.fiscal_year_id === fiscalYearId);

export const getActiveFiscalYear = () => 
  realFiscalYears.find(fy => fy.is_active);

export const getDistributionsByFiscalYear = (fiscalYearId: string) => 
  realDistributions.filter(d => d.fiscal_year_id === fiscalYearId);

// Aliases for compatibility with integration tests
export const mockAccounts = realAccounts;
export const mockJournalEntries = realJournalEntries;
export const mockFiscalYears = realFiscalYears;
export const mockPayments = realPayments;
export const mockDistributions = realDistributions;
export const mockRentalPayments = realPayments;
