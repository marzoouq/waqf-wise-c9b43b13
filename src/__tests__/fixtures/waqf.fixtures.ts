/**
 * Waqf Test Fixtures - بيانات اختبار الوقف
 * @version 1.0.0
 */

export const mockWaqfUnits = [
  {
    id: 'unit-1',
    name: 'قلم الذرية',
    code: 'DHURRIYA',
    description: 'القلم المخصص لتوزيعات الذرية من أبناء وبنات',
    unit_type: 'beneficiary',
    share_percentage: 65,
    is_active: true,
    parent_unit_id: null,
    account_id: 'acc-1',
    budget_allocation: 3000000,
    current_balance: 2500000,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'unit-2',
    name: 'قلم الناظر',
    code: 'NAZER',
    description: 'القلم المخصص لأتعاب الناظر',
    unit_type: 'nazer',
    share_percentage: 10,
    is_active: true,
    parent_unit_id: null,
    account_id: 'acc-2',
    budget_allocation: 500000,
    current_balance: 350000,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'unit-3',
    name: 'قلم الاستثمار',
    code: 'INVESTMENT',
    description: 'القلم المخصص لإعادة الاستثمار وتنمية رأس المال',
    unit_type: 'corpus',
    share_percentage: 20,
    is_active: true,
    parent_unit_id: null,
    account_id: 'acc-3',
    budget_allocation: 1000000,
    current_balance: 750000,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
  {
    id: 'unit-4',
    name: 'قلم الخير',
    code: 'CHARITY',
    description: 'القلم المخصص للأعمال الخيرية',
    unit_type: 'charity',
    share_percentage: 5,
    is_active: true,
    parent_unit_id: null,
    account_id: 'acc-4',
    budget_allocation: 250000,
    current_balance: 175000,
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-06-01T10:00:00Z',
  },
];

export const mockWaqfInfo = {
  id: 'waqf-1',
  name: 'وقف آل عبدالله',
  registration_number: 'WQF-2020-001',
  registration_date: '2020-01-15',
  founder_name: 'عبدالله محمد آل سعود',
  founder_id: 'founder-1',
  nazer_name: 'أحمد عبدالله',
  nazer_id: 'nazer-1',
  total_capital: 50000000,
  establishment_date: '2020-01-01',
  waqf_type: 'family',
  status: 'active',
  description: 'وقف ذري لعائلة آل عبدالله',
  address: 'الرياض، المملكة العربية السعودية',
  phone: '+966501234567',
  email: 'info@alwaqf.sa',
  logo_url: '/logos/waqf-logo.png',
  created_at: '2020-01-01T10:00:00Z',
  updated_at: '2024-06-01T10:00:00Z',
};

export const mockWaqfSettings = {
  distribution_day: 1,
  distribution_frequency: 'monthly',
  auto_distribution: true,
  notification_before_days: 3,
  nazer_approval_required: true,
  minimum_distribution_amount: 100,
  allow_advance_payment: false,
  fiscal_year_start_month: 1,
  currency: 'SAR',
  language: 'ar',
};

export const mockWaqfStats = {
  total_properties: 12,
  total_units: 45,
  total_beneficiaries: 150,
  active_contracts: 38,
  monthly_revenue: 500000,
  monthly_expenses: 150000,
  net_monthly: 350000,
  year_to_date_revenue: 3000000,
  year_to_date_expenses: 900000,
  occupancy_rate: 92,
};

export const mockWaqfBudgets = [
  {
    id: 'budget-1',
    unit_id: 'unit-1',
    unit_name: 'قلم الذرية',
    fiscal_year_id: 'fy-2024',
    allocated_amount: 3000000,
    spent_amount: 1500000,
    remaining_amount: 1500000,
    percentage_used: 50,
  },
  {
    id: 'budget-2',
    unit_id: 'unit-2',
    unit_name: 'قلم الناظر',
    fiscal_year_id: 'fy-2024',
    allocated_amount: 500000,
    spent_amount: 250000,
    remaining_amount: 250000,
    percentage_used: 50,
  },
];

export const mockLinkedProperties = [
  {
    id: 'prop-1',
    waqf_unit_id: 'unit-1',
    property_id: 'property-1',
    property_name: 'عمارة الرياض',
    share_percentage: 100,
    linked_at: '2024-01-01T10:00:00Z',
  },
  {
    id: 'prop-2',
    waqf_unit_id: 'unit-3',
    property_id: 'property-2',
    property_name: 'مركز تجاري جدة',
    share_percentage: 50,
    linked_at: '2024-01-01T10:00:00Z',
  },
];

export const waqfFilters = {
  activeUnitsOnly: { isActive: true },
  byUnitType: { unitType: 'beneficiary' },
  byParentUnit: { parentUnitId: 'unit-1' },
};

export const mockWaqfSummary = {
  total_assets: 50000000,
  total_liabilities: 5000000,
  net_worth: 45000000,
  annual_revenue: 6000000,
  annual_expenses: 1800000,
  annual_net: 4200000,
  beneficiary_distributions: 3500000,
  charity_distributions: 210000,
  nazer_compensation: 420000,
  reinvestment: 840000,
};
