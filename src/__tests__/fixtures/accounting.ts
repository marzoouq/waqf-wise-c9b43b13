import { Database } from '@/integrations/supabase/types';

type JournalEntry = Database['public']['Tables']['journal_entries']['Insert'];
type Account = Database['public']['Tables']['accounts']['Insert'];

export const mockAccount = (overrides?: Partial<Account>): Account => ({
  code: '1000',
  name_ar: 'النقدية',
  name_en: 'Cash',
  account_type: 'asset',
  account_nature: 'debit',
  is_header: false,
  is_active: true,
  current_balance: 0,
  description: 'حساب النقدية بالصندوق',
  ...overrides,
});

export const mockChartOfAccounts = (): Account[] => [
  // الأصول
  mockAccount({ code: '1000', name_ar: 'الأصول', account_type: 'asset', is_header: true }),
  mockAccount({ code: '1100', name_ar: 'الأصول المتداولة', account_type: 'asset', is_header: true, parent_id: '1000' }),
  mockAccount({ code: '1110', name_ar: 'النقدية', account_type: 'asset', current_balance: 500000 }),
  mockAccount({ code: '1120', name_ar: 'البنك', account_type: 'asset', current_balance: 2000000 }),
  mockAccount({ code: '1200', name_ar: 'الأصول الثابتة', account_type: 'asset', is_header: true, parent_id: '1000' }),
  mockAccount({ code: '1210', name_ar: 'العقارات', account_type: 'asset', current_balance: 10000000 }),
  
  // الخصوم
  mockAccount({ code: '2000', name_ar: 'الخصوم', account_type: 'liability', account_nature: 'credit', is_header: true }),
  mockAccount({ code: '2100', name_ar: 'الخصوم المتداولة', account_type: 'liability', account_nature: 'credit', is_header: true }),
  mockAccount({ code: '2110', name_ar: 'الموردون', account_type: 'liability', account_nature: 'credit', current_balance: 50000 }),
  
  // حقوق الملكية
  mockAccount({ code: '3000', name_ar: 'حقوق الملكية', account_type: 'equity', account_nature: 'credit', is_header: true }),
  mockAccount({ code: '3100', name_ar: 'رأس مال الوقف', account_type: 'equity', account_nature: 'credit', current_balance: 12000000 }),
  
  // الإيرادات
  mockAccount({ code: '4000', name_ar: 'الإيرادات', account_type: 'revenue', account_nature: 'credit', is_header: true }),
  mockAccount({ code: '4100', name_ar: 'إيرادات الإيجارات', account_type: 'revenue', account_nature: 'credit', current_balance: 800000 }),
  mockAccount({ code: '4200', name_ar: 'إيرادات أخرى', account_type: 'revenue', account_nature: 'credit', current_balance: 50000 }),
  
  // المصروفات
  mockAccount({ code: '5000', name_ar: 'المصروفات', account_type: 'expense', is_header: true }),
  mockAccount({ code: '5100', name_ar: 'مصاريف إدارية', account_type: 'expense', current_balance: 100000 }),
  mockAccount({ code: '5200', name_ar: 'مصاريف صيانة', account_type: 'expense', current_balance: 80000 }),
  mockAccount({ code: '5300', name_ar: 'مصاريف توزيعات', account_type: 'expense', current_balance: 400000 }),
];

export const mockJournalEntry = (overrides?: Partial<JournalEntry>): JournalEntry => ({
  entry_number: 'JE-2024-001',
  entry_date: '2024-03-01',
  description: 'قيد إيرادات الإيجارات',
  fiscal_year_id: 'fy-2024',
  status: 'posted',
  ...overrides,
});

export const mockJournalEntries = (count: number = 10): JournalEntry[] => {
  const types = ['manual', 'auto', 'adjustment', 'closing'];
  const statuses = ['draft', 'posted', 'approved'];
  const descriptions = [
    'قيد إيرادات الإيجارات',
    'قيد صرف مستحقات المستفيدين',
    'قيد مصاريف الصيانة',
    'قيد مصاريف إدارية',
    'قيد تحويل بنكي',
  ];
  
  return Array.from({ length: count }, (_, i) => 
    mockJournalEntry({ 
      entry_number: `JE-2024-${String(i + 1).padStart(3, '0')}`,
      entry_date: `2024-03-${String((i % 28) + 1).padStart(2, '0')}`,
      description: descriptions[i % descriptions.length],
      fiscal_year_id: 'fy-2024',
    })
  );
};
