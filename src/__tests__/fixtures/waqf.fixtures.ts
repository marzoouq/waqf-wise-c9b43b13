/**
 * Waqf Test Fixtures - بيانات اختبار الوقف
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

export const mockWaqfUnits: any[] = [];

export const mockWaqfInfo = {
  id: '',
  name: '',
  registration_number: '',
  registration_date: '',
  founder_name: '',
  founder_id: '',
  nazer_name: '',
  nazer_id: '',
  total_capital: 0,
  establishment_date: '',
  waqf_type: '',
  status: '',
  description: '',
  address: '',
  phone: '',
  email: '',
  logo_url: '',
  created_at: '',
  updated_at: '',
};

export const mockWaqfSettings = {
  distribution_day: 0,
  distribution_frequency: '',
  auto_distribution: false,
  notification_before_days: 0,
  nazer_approval_required: false,
  minimum_distribution_amount: 0,
  allow_advance_payment: false,
  fiscal_year_start_month: 0,
  currency: '',
  language: '',
};

export const mockWaqfStats = {
  total_properties: 0,
  total_units: 0,
  total_beneficiaries: 0,
  active_contracts: 0,
  monthly_revenue: 0,
  monthly_expenses: 0,
  net_monthly: 0,
  year_to_date_revenue: 0,
  year_to_date_expenses: 0,
  occupancy_rate: 0,
};

export const mockWaqfBudgets: any[] = [];
export const mockLinkedProperties: any[] = [];

export const waqfFilters = {
  activeUnitsOnly: { isActive: true },
  byUnitType: { unitType: '' },
  byParentUnit: { parentUnitId: '' },
};

export const mockWaqfSummary = {
  total_assets: 0,
  total_liabilities: 0,
  net_worth: 0,
  annual_revenue: 0,
  annual_expenses: 0,
  annual_net: 0,
  beneficiary_distributions: 0,
  charity_distributions: 0,
  nazer_compensation: 0,
  reinvestment: 0,
};
