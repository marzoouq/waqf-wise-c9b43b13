import { Database } from '@/integrations/supabase/types';

type BeneficiaryRequest = Database['public']['Tables']['beneficiary_requests']['Insert'];
type RequestType = Database['public']['Tables']['request_types']['Insert'];

export const mockRequestType = (overrides?: Partial<RequestType>): RequestType => ({
  name: 'فزعة طارئة',
  name_ar: 'فزعة طارئة',
  description: 'طلب مساعدة مالية طارئة',
  icon: 'alert-circle',
  requires_approval: true,
  sla_hours: 24,
  is_active: true,
  ...overrides,
});

export const mockRequestTypes = (): RequestType[] => [
  mockRequestType({ name: 'فزعة طارئة', name_ar: 'فزعة طارئة', sla_hours: 24 }),
  mockRequestType({ name: 'قرض حسن', name_ar: 'قرض حسن', sla_hours: 72 }),
  mockRequestType({ name: 'تحديث بيانات', name_ar: 'تحديث بيانات', requires_approval: false, sla_hours: 48 }),
  mockRequestType({ name: 'إضافة مولود', name_ar: 'إضافة مولود', sla_hours: 48 }),
  mockRequestType({ name: 'استقلالية زوجة', name_ar: 'استقلالية زوجة', sla_hours: 72 }),
];

export const mockBeneficiaryRequest = (
  beneficiaryId: string, 
  requestTypeId: string, 
  overrides?: Partial<BeneficiaryRequest>
): BeneficiaryRequest => ({
  beneficiary_id: beneficiaryId,
  request_type_id: requestTypeId,
  description: 'احتاج لمساعدة مالية طارئة لعلاج والدتي',
  amount: 5000,
  status: 'pending',
  priority: 'high',
  request_number: 'REQ-2024-001',
  ...overrides,
});

export const mockBeneficiaryRequests = (
  beneficiaryId: string, 
  requestTypeIds: string[],
  count: number = 5
): BeneficiaryRequest[] => {
  const statuses = ['pending', 'under_review', 'approved', 'rejected', 'completed'];
  const priorities = ['low', 'normal', 'high', 'urgent'];
  const descriptions = [
    'احتاج لمساعدة مالية طارئة لعلاج والدتي',
    'أرغب في الحصول على قرض لشراء سيارة',
    'تحديث رقم الجوال والعنوان',
    'إضافة مولود جديد للعائلة',
    'طلب فصل حساب الزوجة الثانية',
  ];
  
  return Array.from({ length: count }, (_, i) => 
    mockBeneficiaryRequest(
      beneficiaryId,
      requestTypeIds[i % requestTypeIds.length],
      { 
        request_number: `REQ-2024-${String(i + 1).padStart(3, '0')}`,
        description: descriptions[i % descriptions.length],
        amount: i % 2 === 0 ? 3000 + (i * 1000) : undefined,
        status: statuses[i % statuses.length],
        priority: priorities[i % priorities.length],
      }
    )
  );
};
