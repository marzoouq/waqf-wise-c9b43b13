/**
 * بيانات اختبار العقارات الحقيقية
 * Real Properties Test Fixtures
 * مطابقة للبيانات الفعلية في قاعدة البيانات
 */

// العقارات الحقيقية - 6 عقارات (بدون type constraints)
export const realProperties = [
  {
    id: 'prop-001',
    name: 'عقار السامر 2',
    type: 'سكني تجاري',
    location: 'الطائف',
    address: 'حي السامر، شارع الملك فهد',
    total_units: 8,
    apartment_count: 8,
    monthly_revenue: 29166.67,
    status: 'نشط',
    description: 'عمارة سكنية تجارية من 4 طوابق',
    floors: 4,
    occupancy_percentage: 100,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-12-01T00:00:00Z',
  },
  {
    id: 'prop-002',
    name: 'عقار السامر 3',
    type: 'سكني تجاري',
    location: 'الطائف',
    address: 'حي السامر، شارع الأمير سلطان',
    total_units: 10,
    apartment_count: 10,
    monthly_revenue: 33333.33,
    status: 'نشط',
    description: 'عمارة سكنية تجارية من 5 طوابق',
    floors: 5,
    occupancy_percentage: 100,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prop-003',
    name: 'عقار الطائف 1',
    type: 'سكني تجاري',
    location: 'الطائف',
    address: 'حي الشهداء',
    total_units: 8,
    apartment_count: 8,
    monthly_revenue: 0,
    status: 'شاغر',
    description: 'عمارة سكنية تجارية من 4 طوابق',
    floors: 4,
    occupancy_percentage: 0,
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'prop-004',
    name: 'عقار الطائف 2',
    type: 'سكني تجاري',
    location: 'الطائف',
    address: 'حي الفيصلية',
    total_units: 9,
    apartment_count: 9,
    monthly_revenue: 0,
    status: 'شاغر',
    description: 'عمارة سكنية تجارية من 4 طوابق',
    floors: 4,
    occupancy_percentage: 0,
    created_at: '2024-06-01T00:00:00Z',
  },
  {
    id: 'prop-005',
    name: 'مزرعة الطائف',
    type: 'زراعي',
    location: 'الطائف',
    address: 'طريق الهدا',
    total_units: 1,
    apartment_count: 0,
    monthly_revenue: 0,
    status: 'شاغر',
    description: 'مزرعة زراعية',
    floors: 0,
    occupancy_percentage: 0,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'prop-006',
    name: 'أرض جدة',
    type: 'أرض',
    location: 'جدة',
    address: 'حي الروضة',
    total_units: 0,
    apartment_count: 0,
    monthly_revenue: 0,
    status: 'شاغر',
    description: 'قطعة أرض استثمارية',
    floors: 0,
    occupancy_percentage: 0,
    created_at: '2024-01-01T00:00:00Z',
  },
];

// العقود الحقيقية - 4 عقود
export const realContracts = [
  {
    id: 'cont-001',
    contract_number: 'CNT-2024-001',
    property_id: 'prop-001',
    tenant_id: 'ten-001',
    tenant_name: 'شركة القويشي للتجارة',
    start_date: '2024-11-01',
    end_date: '2025-10-31',
    monthly_rent: 29166.67,
    payment_frequency: 'سنوي',
    status: 'نشط',
    contract_type: 'إيجار تجاري',
    total_amount: 350000,
    created_at: '2024-10-15T00:00:00Z',
  },
  {
    id: 'cont-002',
    contract_number: 'CNT-2024-002',
    property_id: 'prop-002',
    tenant_id: 'ten-002',
    tenant_name: 'مؤسسة رواء للخدمات',
    start_date: '2024-10-01',
    end_date: '2025-09-30',
    monthly_rent: 33333.33,
    payment_frequency: 'سنوي',
    status: 'نشط',
    contract_type: 'إيجار تجاري',
    total_amount: 400000,
    created_at: '2024-09-20T00:00:00Z',
  },
  {
    id: 'cont-003',
    contract_number: 'CNT-2024-003',
    property_id: 'prop-001',
    tenant_id: 'ten-003',
    tenant_name: 'الثبيتي للاستثمار',
    start_date: '2024-12-01',
    end_date: '2025-11-30',
    monthly_rent: 8333.33,
    payment_frequency: 'سنوي',
    status: 'نشط',
    contract_type: 'إيجار تجاري',
    total_amount: 100000,
    created_at: '2024-11-25T00:00:00Z',
  },
  {
    id: 'cont-004',
    contract_number: 'CNT-2025-001',
    property_id: 'prop-001',
    tenant_id: 'ten-004',
    tenant_name: 'دار الذهب للمجوهرات',
    start_date: '2026-04-12',
    end_date: '2027-04-11',
    monthly_rent: 62500,
    payment_frequency: 'سنوي',
    status: 'مسودة',
    contract_type: 'إيجار تجاري',
    total_amount: 750000,
    created_at: '2024-12-01T00:00:00Z',
  },
];

// إحصائيات العقارات المحسوبة
export const propertyStats = {
  total: realProperties.length,
  active: realProperties.filter(p => p.status === 'نشط').length,
  vacant: realProperties.filter(p => p.status === 'شاغر').length,
  totalUnits: realProperties.reduce((sum, p) => sum + (p.total_units || 0), 0),
  totalMonthlyRevenue: realProperties.reduce((sum, p) => sum + (p.monthly_revenue || 0), 0),
};

// إحصائيات العقود المحسوبة
export const contractStats = {
  total: realContracts.length,
  active: realContracts.filter(c => c.status === 'نشط').length,
  draft: realContracts.filter(c => c.status === 'مسودة').length,
  totalAmount: realContracts.filter(c => c.status === 'نشط').reduce((sum, c) => sum + (c.total_amount || 0), 0),
};

// المستأجرين
export const realTenants = [
  {
    id: 'ten-001',
    name: 'شركة القويشي للتجارة',
    national_id: '7001234567',
    phone: '0551234567',
    email: 'info@quwaishi.sa',
    iban: 'SA9876543210987654321098',
    bank_name: 'بنك الرياض',
    status: 'نشط',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ten-002',
    name: 'مؤسسة رواء للخدمات',
    national_id: '7001234568',
    phone: '0551234568',
    email: 'info@rawaa.sa',
    iban: 'SA1122334455667788990011',
    bank_name: 'البنك الأهلي',
    status: 'نشط',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'ten-003',
    name: 'الثبيتي للاستثمار',
    national_id: '7001234569',
    phone: '0551234569',
    email: 'info@thubaiti-inv.sa',
    status: 'نشط',
    created_at: '2024-11-01T00:00:00Z',
  },
  {
    id: 'ten-004',
    name: 'دار الذهب للمجوهرات',
    national_id: '7001234570',
    phone: '0551234570',
    email: 'info@daraldhahab.sa',
    status: 'معلق',
    created_at: '2024-12-01T00:00:00Z',
  },
];

// Helper functions
export const getActiveProperties = () => 
  realProperties.filter(p => p.status === 'نشط');

export const getPropertyById = (id: string) => 
  realProperties.find(p => p.id === id);

export const getActiveContracts = () => 
  realContracts.filter(c => c.status === 'نشط');

export const getContractsByPropertyId = (propertyId: string) => 
  realContracts.filter(c => c.property_id === propertyId);

export const getTenantById = (id: string) => 
  realTenants.find(t => t.id === id);

// Aliases for compatibility with integration tests
export const mockProperties = realProperties;
export const mockContracts = realContracts;
export const mockTenants = realTenants;
