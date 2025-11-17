import { Database } from '@/integrations/supabase/types';

type Beneficiary = Database['public']['Tables']['beneficiaries']['Row'];

export const mockBeneficiary = (overrides?: Partial<Beneficiary>): Beneficiary => ({
  id: 'test-ben-001',
  full_name: 'عبدالله محمد الأحمد',
  national_id: '1234567890',
  phone: '0501234567',
  category: 'أسر منتجة',
  status: 'active',
  email: 'beneficiary@test.com',
  date_of_birth: '1990-01-01',
  gender: 'male',
  marital_status: 'married',
  nationality: 'سعودي',
  city: 'الرياض',
  address: 'حي النخيل، شارع الملك فهد',
  bank_name: 'البنك الأهلي',
  bank_account_number: '12345678',
  iban: 'SA0380000000608010167519',
  employment_status: 'unemployed',
  monthly_income: 0,
  family_size: 5,
  number_of_sons: 2,
  number_of_daughters: 1,
  number_of_wives: 1,
  housing_type: 'rent',
  priority_level: 1,
  is_head_of_family: true,
  tribe: 'قبيلة الأحمد',
  family_name: 'عائلة الأحمد',
  notes: null,
  tags: ['أولوية عالية', 'أسرة كبيرة'],
  beneficiary_number: 'BEN-2025-001',
  beneficiary_type: 'ولد',
  can_login: false,
  username: null,
  user_id: null,
  last_login_at: null,
  login_enabled_at: null,
  notification_preferences: { email: true, sms: true, push: true },
  last_notification_at: null,
  parent_beneficiary_id: null,
  relationship: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  ...overrides,
});

export const mockBeneficiaries = (count: number = 5): Beneficiary[] => {
  return Array.from({ length: count }, (_, i) => 
    mockBeneficiary({ 
      id: `test-ben-${String(i + 1).padStart(3, '0')}`,
      full_name: `مستفيد ${i + 1}`,
      national_id: `123456789${i}`,
      beneficiary_number: `BEN-2025-${String(i + 1).padStart(3, '0')}`,
    })
  );
};

export const mockFamilyMember = (parentId: string, relationship: string): Beneficiary => 
  mockBeneficiary({
    id: `test-member-${Date.now()}`,
    is_head_of_family: false,
    parent_beneficiary_id: parentId,
    relationship,
  });
