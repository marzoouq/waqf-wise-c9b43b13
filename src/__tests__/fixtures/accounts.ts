import { Database } from '@/integrations/supabase/types';

type Account = Database['public']['Tables']['accounts']['Row'];

export const mockAccount = (overrides?: Partial<Account>): Account => ({
  id: 'test-account-001',
  code: '1000',
  name_ar: 'الأصول المتداولة',
  name_en: 'Current Assets',
  account_type: 'asset',
  account_nature: 'debit',
  is_header: true,
  is_active: true,
  current_balance: 0,
  parent_id: null,
  description: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

export const mockAccounts = (count: number = 5): Account[] => {
  return Array.from({ length: count }, (_, i) => 
    mockAccount({ 
      id: `test-account-${String(i + 1).padStart(3, '0')}`,
      code: `${1000 + i * 100}`,
      name_ar: `حساب ${i + 1}`,
      is_header: i === 0,
    })
  );
};

export const createAccountTree = () => {
  const parent = mockAccount({
    id: 'parent-001',
    code: '1000',
    name_ar: 'الأصول',
    is_header: true,
  });
  
  const child1 = mockAccount({
    id: 'child-001',
    code: '1100',
    name_ar: 'الأصول المتداولة',
    parent_id: parent.id,
    is_header: false,
    current_balance: 100000,
  });
  
  const child2 = mockAccount({
    id: 'child-002',
    code: '1200',
    name_ar: 'الأصول الثابتة',
    parent_id: parent.id,
    is_header: false,
    current_balance: 500000,
  });
  
  return { parent, children: [child1, child2] };
};
