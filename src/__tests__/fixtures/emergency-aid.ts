import { Database } from '@/integrations/supabase/types';

type EmergencyAid = Database['public']['Tables']['emergency_aid_requests']['Insert'];

/**
 * طلبات فزعة واقعية للمستفيدين
 */
export const mockEmergencyAidRequests = (beneficiaryIds: string[]): EmergencyAid[] => [
  {
    beneficiary_id: beneficiaryIds[0],
    request_number: 'EA-2024-001',
    amount_requested: 5000,
    reason: 'علاج طارئ - عملية جراحية لأحد أفراد العائلة',
    urgency_level: 'عاجل جداً',
    status: 'معتمد',
    amount_approved: 5000,
    approved_at: '2024-11-16T00:00:00.000Z',
    notes: 'تم الصرف عاجلاً نظراً لحالة الطوارئ الطبية',
  },
  {
    beneficiary_id: beneficiaryIds[1],
    request_number: 'EA-2024-002',
    amount_requested: 3000,
    reason: 'تكاليف دراسية - رسوم الجامعة للفصل الدراسي',
    urgency_level: 'عادي',
    status: 'معلق',
    notes: 'قيد المراجعة - انتظار الموافقة',
  },
  {
    beneficiary_id: beneficiaryIds[2],
    request_number: 'EA-2024-003',
    amount_requested: 8000,
    reason: 'إصلاح السيارة - تعطل كامل للمركبة',
    urgency_level: 'عاجل',
    status: 'معتمد',
    amount_approved: 6000,
    approved_at: '2024-11-22T00:00:00.000Z',
    notes: 'تمت الموافقة على مبلغ مخفض بناءً على التقييم',
  },
  {
    beneficiary_id: beneficiaryIds[3],
    request_number: 'EA-2024-004',
    amount_requested: 10000,
    reason: 'دين متراكم - سداد ديون متأخرة',
    urgency_level: 'عادي',
    status: 'مرفوض',
    notes: 'تم الرفض - عدم توفر المبرر الكافي للمبلغ المطلوب',
  },
  {
    beneficiary_id: beneficiaryIds[4],
    request_number: 'EA-2024-005',
    amount_requested: 4000,
    reason: 'صيانة منزل - إصلاح تسربات المياه',
    urgency_level: 'عاجل',
    status: 'معلق',
    notes: 'قيد التقييم الفني',
  },
];
