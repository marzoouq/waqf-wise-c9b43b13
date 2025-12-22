-- ============================================
-- حذف الفهارس غير المستخدمة
-- Remove Unused Indexes for Write Performance
-- ============================================

-- فهارس على جداول السجلات (نادراً ما تُستخدم للقراءة)
DROP INDEX IF EXISTS idx_audit_logs_archive_created_at;
DROP INDEX IF EXISTS idx_backup_logs_created_at;

-- فهارس مكررة على funds (لدينا idx_funds_active_lookup الجديد)
DROP INDEX IF EXISTS idx_funds_created_at;
DROP INDEX IF EXISTS idx_funds_category;
DROP INDEX IF EXISTS idx_funds_is_active;

-- فهارس على جداول صغيرة (لا تحتاج فهرس)
DROP INDEX IF EXISTS idx_landing_settings_active;
DROP INDEX IF EXISTS idx_request_types_active;
DROP INDEX IF EXISTS idx_beneficiary_categories_active;
DROP INDEX IF EXISTS idx_kb_faqs_active_sort;

-- فهارس على profiles (لدينا idx_profiles_user_id الجديد)
DROP INDEX IF EXISTS idx_profiles_created_at;

-- فهارس على pending_system_fixes (جدول مؤقت)
DROP INDEX IF EXISTS idx_pending_system_fixes_audit_id;
DROP INDEX IF EXISTS idx_pending_system_fixes_severity;

-- فهارس على smart_alerts
DROP INDEX IF EXISTS idx_smart_alerts_created_at;

-- فهرس مكرر على user_roles (لدينا idx_user_roles_user_role الجديد)
DROP INDEX IF EXISTS idx_user_roles_role;

-- فهرس على contracts (نحتفظ بالـ pkey فقط)
DROP INDEX IF EXISTS idx_con_active;

-- فهرس على journal_entry_lines (لدينا idx_journal_entry_lines_entry_id الجديد)
DROP INDEX IF EXISTS idx_jel_account_entry;