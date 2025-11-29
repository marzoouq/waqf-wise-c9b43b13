-- حذف الجداول غير المستخدمة في التطبيق
-- ترتيب الحذف يراعي العلاقات (Foreign Keys)

-- 1. حذف جداول التشفير (encryption) - غير مستخدمة
DROP TABLE IF EXISTS encrypted_data_registry CASCADE;
DROP TABLE IF EXISTS encrypted_files CASCADE;
DROP TABLE IF EXISTS encrypted_sensitive_data CASCADE;
DROP TABLE IF EXISTS encryption_key_rotation_history CASCADE;
DROP TABLE IF EXISTS encryption_keys CASCADE;

-- 2. حذف جداول النظام الداخلية - غير مستخدمة
DROP TABLE IF EXISTS cache_entries CASCADE;
DROP TABLE IF EXISTS cleanup_logs CASCADE;
DROP TABLE IF EXISTS deleted_files_audit CASCADE;
DROP TABLE IF EXISTS external_api_logs CASCADE;
DROP TABLE IF EXISTS permissions_audit CASCADE;

-- 3. حذف جداول بوابات الدفع والحكومة - غير مستخدمة
DROP TABLE IF EXISTS gateway_transactions CASCADE;
DROP TABLE IF EXISTS government_queries CASCADE;

-- 4. حذف جداول التقارير والمحاكاة - غير مستخدمة
-- حذف الإشارات أولاً
ALTER TABLE IF EXISTS distributions DROP CONSTRAINT IF EXISTS distributions_simulation_id_fkey;
ALTER TABLE IF EXISTS simulation_beneficiary_details DROP CONSTRAINT IF EXISTS simulation_beneficiary_details_simulation_id_fkey;
DROP TABLE IF EXISTS distribution_reports CASCADE;
DROP TABLE IF EXISTS distribution_simulations CASCADE;
DROP TABLE IF EXISTS simulation_beneficiary_details CASCADE;

-- 5. حذف جداول لوحات التحكم المخصصة - غير مستخدمة
DROP TABLE IF EXISTS custom_dashboards CASCADE;
DROP TABLE IF EXISTS custom_kpis CASCADE;
DROP TABLE IF EXISTS dashboard_configs CASCADE;

-- 6. حذف جداول السياسات والمراجعات - غير مستخدمة
DROP TABLE IF EXISTS policy_reviews CASCADE;

-- 7. حذف جداول OCR - غير مستخدمة
DROP TABLE IF EXISTS ocr_corrections CASCADE;
DROP TABLE IF EXISTS ocr_processing_log CASCADE;

-- 8. حذف جداول التنبيهات - غير مستخدمة
-- حذف auto_fix_attempts أولاً لأنها تعتمد على alert_rules
DROP TABLE IF EXISTS auto_fix_attempts CASCADE;
DROP TABLE IF EXISTS alert_escalations CASCADE;
DROP TABLE IF EXISTS alert_rules CASCADE;

-- إزالة العمود simulation_id من distributions إذا كان موجوداً
ALTER TABLE IF EXISTS distributions DROP COLUMN IF EXISTS simulation_id;