/**
 * بيانات اختبارية محسّنة
 * Test Data Fixtures
 */

export const testBeneficiaries = [
  {
    full_name: 'عبدالله محمد الأحمد',
    national_id: '1234567890',
    phone: '0501234567',
    category: 'ذكور',
    status: 'نشط',
    email: 'abdullah@test.sa',
  },
  {
    full_name: 'فاطمة علي السعيد',
    national_id: '9876543210',
    phone: '0509876543',
    category: 'إناث',
    status: 'نشط',
    email: 'fatima@test.sa',
  },
];

export const testDistributions = [
  {
    distribution_name: 'توزيع ربع سنوي Q1 2025',
    total_amount: 500000,
    distribution_date: '2025-03-31',
    status: 'معتمد',
  },
  {
    distribution_name: 'توزيع استثنائي',
    total_amount: 100000,
    distribution_date: '2025-01-15',
    status: 'معلق',
  },
];

export const testProperties = [
  {
    name: 'عمارة الوقف رقم 1',
    property_type: 'عمارة سكنية',
    location: 'الرياض - حي النخيل',
    total_units: 12,
    status: 'مؤجر',
  },
  {
    name: 'محل تجاري وسط البلد',
    property_type: 'محل تجاري',
    location: 'الرياض - وسط المدينة',
    total_units: 1,
    status: 'متاح',
  },
];

export const testContracts = [
  {
    tenant_name: 'شركة التطوير المحدودة',
    tenant_id: '1122334455',
    monthly_rent: 25000,
    start_date: '2024-01-01',
    end_date: '2025-12-31',
    status: 'نشط',
  },
];

export const testPayments = [
  {
    payment_type: 'إيجار',
    amount: 25000,
    payment_date: '2025-01-01',
    payment_method: 'تحويل بنكي',
    status: 'مكتمل',
  },
];

export const testRequests = [
  {
    description: 'طلب مساعدة مالية طارئة',
    amount: 5000,
    priority: 'عالية',
    status: 'معلق',
  },
  {
    description: 'تحديث البيانات الشخصية',
    priority: 'عادية',
    status: 'قيد المراجعة',
  },
];

export const testDocuments = [
  {
    name: 'عقد الإيجار 2025',
    file_type: 'application/pdf',
    category: 'عقود',
    file_path: '/test/contract-2025.pdf',
  },
  {
    name: 'صورة الهوية',
    file_type: 'image/jpeg',
    category: 'هويات',
    file_path: '/test/id-card.jpg',
  },
];
