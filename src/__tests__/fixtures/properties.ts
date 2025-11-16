import { Database } from '@/integrations/supabase/types';

type Property = Database['public']['Tables']['properties']['Row'];

export const mockProperty = (overrides?: Partial<Property>): Property => ({
  id: 'test-property-001',
  name: 'محل تجاري - شارع الملك',
  type: 'commercial',
  location: 'الرياض - حي الملك فهد',
  units: 1,
  occupied: 1,
  status: 'occupied',
  monthly_revenue: 10000,
  description: 'محل تجاري في موقع استراتيجي',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  waqf_unit_id: null,
  total_units: 1,
  occupied_units: 1,
  available_units: 0,
  occupancy_percentage: 100,
  ...overrides,
});

export const mockProperties = (count: number = 3): Property[] => {
  return Array.from({ length: count }, (_, i) => 
    mockProperty({ 
      id: `test-property-${String(i + 1).padStart(3, '0')}`,
      name: `عقار ${i + 1}`,
      monthly_revenue: 10000 * (i + 1),
    })
  );
};

export const mockContract = (propertyId: string) => ({
  id: 'test-contract-001',
  property_id: propertyId,
  contract_number: 'CONT-001',
  contract_type: 'rental',
  tenant_name: 'مستأجر اختبار',
  tenant_phone: '0501234567',
  tenant_id_number: '1234567890',
  tenant_email: 'tenant@test.com',
  start_date: '2025-01-01',
  end_date: '2025-12-31',
  monthly_rent: 10000,
  payment_frequency: 'monthly',
  status: 'active',
  security_deposit: 0,
  is_renewable: true,
  auto_renew: false,
  renewal_notice_days: 30,
  notes: null,
  terms_and_conditions: null,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  created_by: null,
});
