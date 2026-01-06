-- ============================================
-- 1️⃣ حذف الفهارس المكررة (6 فهارس)
-- ============================================

-- families: حذف idx_families_lookup (مكرر مع families_pkey)
DROP INDEX IF EXISTS public.idx_families_lookup;

-- families: حذف idx_families_head_of_family (مكرر مع idx_families_head_of_family_id)
DROP INDEX IF EXISTS public.idx_families_head_of_family;

-- journal_entry_lines: حذف idx_journal_entry_lines_entry (مكرر مع idx_journal_entry_lines_entry_id)
DROP INDEX IF EXISTS public.idx_journal_entry_lines_entry;

-- login_attempts_log: حذف idx_login_log_email (مكرر مع idx_login_attempts_log_email_time)
DROP INDEX IF EXISTS public.idx_login_log_email;

-- maintenance_requests: حذف idx_maintenance_status (مكرر مع idx_maintenance_requests_status)
DROP INDEX IF EXISTS public.idx_maintenance_status;

-- profiles: حذف idx_profiles_user_id (مكرر مع profiles_user_id_key)
DROP INDEX IF EXISTS public.idx_profiles_user_id;

-- ============================================
-- 2️⃣ دمج سياسات RLS المكررة على audit_logs
-- ============================================

-- حذف السياسات المكررة القديمة
DROP POLICY IF EXISTS "No one can delete audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "No one can update audit logs" ON public.audit_logs;

-- الإبقاء على السياسات الموجودة: audit_logs_no_delete و audit_logs_no_update
-- (هي نفسها لكن بأسماء أفضل)