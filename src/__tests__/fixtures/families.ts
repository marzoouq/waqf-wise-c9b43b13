import { Database } from '@/integrations/supabase/types';

type Family = Database['public']['Tables']['families']['Row'];

export const mockFamily = (overrides?: Partial<Family>): Family => ({
  id: 'test-family-001',
  family_name: 'عائلة الاختبار',
  head_of_family_id: 'test-ben-001',
  tribe: 'قبيلة الاختبار',
  total_members: 5,
  status: 'active',
  notes: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

export const mockFamilies = (count: number = 3): Family[] => {
  return Array.from({ length: count }, (_, i) => 
    mockFamily({ 
      id: `test-family-${String(i + 1).padStart(3, '0')}`,
      family_name: `عائلة ${i + 1}`,
      head_of_family_id: `test-ben-${String(i + 1).padStart(3, '0')}`,
      total_members: 5 + i,
    })
  );
};

export const mockFamilyMember = (familyId: string, beneficiaryId: string) => ({
  id: 'test-member-001',
  family_id: familyId,
  beneficiary_id: beneficiaryId,
  relationship_to_head: 'son',
  is_dependent: true,
  priority_level: 1,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
});
