import { Database } from '@/integrations/supabase/types';

type Distribution = Database['public']['Tables']['distributions']['Row'];

export const mockDistribution = (overrides?: Partial<Distribution>): Distribution => ({
  id: 'test-dist-001',
  distribution_date: '2025-01-15',
  month: '2025-01',
  total_amount: 500000,
  beneficiaries_count: 50,
  status: 'draft',
  notes: null,
  journal_entry_id: null,
  distribution_type: 'شهري',
  period_start: '2025-01-01',
  period_end: '2025-01-31',
  total_revenues: 600000,
  total_expenses: 100000,
  net_revenues: 500000,
  nazer_share: 50000,
  waqif_charity: 25000,
  waqf_corpus: 0,
  distributable_amount: 425000,
  waqf_name: 'وقف الاختبار',
  sons_count: 20,
  daughters_count: 15,
  wives_count: 5,
  nazer_percentage: 10,
  charity_percentage: 5,
  corpus_percentage: 0,
  expenses_amount: 100000,
  bank_statement_ref: null,
  maintenance_amount: 0,
  reserve_amount: 0,
  calculation_notes: 'حساب تسلسلي: صيانة ← ناظر ← صدقة ← مستفيدين',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

export const mockDistributions = (count: number = 3): Distribution[] => {
  return Array.from({ length: count }, (_, i) => 
    mockDistribution({ 
      id: `test-dist-${String(i + 1).padStart(3, '0')}`,
      total_amount: 500000 * (i + 1),
      beneficiaries_count: 50 + (i * 10),
      month: `2025-${String(i + 1).padStart(2, '0')}`,
    })
  );
};
