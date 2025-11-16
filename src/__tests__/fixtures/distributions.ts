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
