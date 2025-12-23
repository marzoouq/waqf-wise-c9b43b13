/**
 * Settings Test Fixtures - بيانات اختبار الإعدادات
 * @version 1.0.0
 */

export const mockLandingSettings = [
  {
    id: 'setting-1',
    key: 'hero_title',
    value: 'مرحباً بكم في وقف الخير',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'setting-2',
    key: 'hero_subtitle',
    value: 'نسعى لخدمة المستفيدين بأفضل الطرق',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'setting-3',
    key: 'show_stats',
    value: 'true',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'setting-4',
    key: 'contact_email',
    value: 'info@waqf.sa',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
];

export const mockZATCASettings = {
  vat_number: '300000000000003',
  seller_name: 'وقف الخير',
  seller_address: 'الرياض، المملكة العربية السعودية',
  vat_percentage: '15',
  invoice_type: 'B2C',
  is_enabled: 'true',
};

export const mockNotificationSettings = {
  id: 'notif-settings-1',
  user_id: 'user-1',
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  payment_alerts: true,
  distribution_alerts: true,
  request_updates: true,
  system_announcements: true,
  marketing_emails: false,
  daily_digest: false,
  weekly_summary: true,
  quiet_hours_start: '22:00',
  quiet_hours_end: '08:00',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

export const mockIntegrations = [
  {
    id: 'integration-1',
    integration_type: 'sms',
    provider_name: 'Twilio',
    is_active: true,
    configuration: {
      account_sid: 'AC***',
      from_number: '+966500000000',
    },
    last_sync_at: '2024-01-15T10:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'integration-2',
    integration_type: 'email',
    provider_name: 'SendGrid',
    is_active: true,
    configuration: {
      from_email: 'noreply@waqf.sa',
      from_name: 'وقف الخير',
    },
    last_sync_at: '2024-01-15T10:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'integration-3',
    integration_type: 'payment',
    provider_name: 'Moyasar',
    is_active: false,
    configuration: {
      merchant_id: 'merchant_***',
    },
    last_sync_at: null,
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

export const mockBankIntegrations = [
  {
    id: 'bank-1',
    bank_name: 'البنك الأهلي السعودي',
    bank_code: 'NCB',
    api_endpoint: 'https://api.ncb.com',
    api_version: 'v2',
    auth_method: 'oauth2',
    is_active: true,
    supports_transfers: true,
    supports_balance_inquiry: true,
    supports_statement: true,
    configuration: {},
    last_sync_at: '2024-01-15T10:00:00Z',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'bank-2',
    bank_name: 'بنك الراجحي',
    bank_code: 'RJHI',
    api_endpoint: 'https://api.rajhibank.com',
    api_version: 'v1',
    auth_method: 'api_key',
    is_active: true,
    supports_transfers: true,
    supports_balance_inquiry: true,
    supports_statement: false,
    configuration: {},
    last_sync_at: '2024-01-14T10:00:00Z',
    created_at: '2023-06-01T00:00:00Z',
    updated_at: '2024-01-14T10:00:00Z',
  },
];

export const mockTransparencySettings = {
  id: 'transparency-1',
  show_total_distributions: true,
  show_beneficiaries_count: true,
  show_properties_count: true,
  show_annual_report: true,
  show_financial_statements: false,
  public_disclosures: true,
  allow_anonymous_inquiries: false,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
};

export const mockSavedFilters = [
  {
    id: 'filter-1',
    name: 'المستفيدين النشطين',
    filter_type: 'beneficiaries',
    filter_criteria: { status: 'نشط', category: 'الفئة الأولى' },
    is_favorite: true,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
  },
  {
    id: 'filter-2',
    name: 'الفواتير المعلقة',
    filter_type: 'invoices',
    filter_criteria: { status: 'معلق' },
    is_favorite: false,
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
  },
];

export const mockAdvancedSettings = {
  cache_ttl_minutes: 30,
  max_upload_size_mb: 10,
  session_timeout_minutes: 60,
  password_expiry_days: 90,
  max_login_attempts: 5,
  enable_2fa: true,
  enable_audit_logging: true,
  enable_performance_monitoring: true,
  enable_error_tracking: true,
  maintenance_mode: false,
  debug_mode: false,
};

export const updateSettingInput = {
  key: 'hero_title',
  value: 'عنوان جديد للصفحة الرئيسية',
};

export const saveFilterInput = {
  name: 'فلتر جديد',
  filter_type: 'beneficiaries',
  filter_criteria: { status: 'معلق' },
  is_favorite: false,
};
