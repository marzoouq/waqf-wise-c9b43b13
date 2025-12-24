/**
 * Settings Test Fixtures - بيانات اختبار الإعدادات
 * تم إفراغ المحتوى - جاهز لإضافة بيانات جديدة
 */

// تصديرات فارغة
export const mockLandingSettings: any[] = [];
export const mockIntegrations: any[] = [];
export const mockBankIntegrations: any[] = [];
export const mockSavedFilters: any[] = [];

export const mockZATCASettings = {
  vat_number: '',
  seller_name: '',
  seller_address: '',
  invoice_type: 'standard',
};

export const mockNotificationSettings = {
  user_id: 'user-1',
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  payment_alerts: true,
  distribution_alerts: true,
  request_updates: true,
  system_announcements: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  daily_digest: false,
  weekly_summary: true,
};

export const mockTransparencySettings = {
  show_annual_report: true,
  show_beneficiaries_count: true,
  show_total_distributions: true,
  show_properties_count: true,
  show_financial_statements: true,
  public_disclosures: true,
  allow_anonymous_inquiries: false,
};

export const mockAdvancedSettings = {
  cache_ttl_minutes: 30,
  max_upload_size_mb: 10,
  enable_2fa: false,
  session_timeout_minutes: 60,
  max_login_attempts: 5,
  enable_audit_logging: true,
};

export const updateSettingInput = {};
export const saveFilterInput = {};
