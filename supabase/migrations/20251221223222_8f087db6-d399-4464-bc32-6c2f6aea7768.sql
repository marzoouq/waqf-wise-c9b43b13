
-- إضافة فهارس مفقودة لتحسين الأداء

-- 1. profiles: فهرس على created_at للترتيب
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at DESC);

-- 2. smart_alerts: فهرس على created_at للترتيب
CREATE INDEX IF NOT EXISTS idx_smart_alerts_created_at ON smart_alerts(created_at DESC);

-- 3. beneficiary_categories: فهرس على is_active
CREATE INDEX IF NOT EXISTS idx_beneficiary_categories_active ON beneficiary_categories(is_active) WHERE is_active = true;

-- 4. backup_logs: فهرس على created_at
CREATE INDEX IF NOT EXISTS idx_backup_logs_created_at ON backup_logs(created_at DESC);

-- 5. kb_faqs: فهرس على is_active و sort_order
CREATE INDEX IF NOT EXISTS idx_kb_faqs_active_sort ON kb_faqs(is_active, sort_order) WHERE is_active = true;

-- 6. landing_page_settings: فهرس على is_active
CREATE INDEX IF NOT EXISTS idx_landing_settings_active ON landing_page_settings(is_active) WHERE is_active = true;

-- 7. request_types: فهرس على is_active
CREATE INDEX IF NOT EXISTS idx_request_types_active ON request_types(is_active) WHERE is_active = true;
