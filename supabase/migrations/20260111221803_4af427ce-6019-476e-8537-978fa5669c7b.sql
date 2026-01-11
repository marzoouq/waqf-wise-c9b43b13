-- =====================================================
-- المرحلة 1: إصلاح سياسات RLS الحرجة
-- تغيير من 'public' إلى 'authenticated'
-- =====================================================

-- 1. إصلاح سياسات activities
ALTER POLICY "Admins can manage activities" ON public.activities TO authenticated;
DROP POLICY IF EXISTS "المدراء والمحاسبون يمكنهم رؤية ال" ON public.activities;

-- 2. إصلاح سياسات ai_system_audits
ALTER POLICY "ai_system_audits_delete" ON public.ai_system_audits TO authenticated;
ALTER POLICY "ai_system_audits_insert" ON public.ai_system_audits TO authenticated;
ALTER POLICY "ai_system_audits_select" ON public.ai_system_audits TO authenticated;
ALTER POLICY "ai_system_audits_update" ON public.ai_system_audits TO authenticated;

-- 3. إصلاح سياسات approval_stats
DROP POLICY IF EXISTS "الأدوار الإدارية والمالية فقط يمك" ON public.approval_stats;
CREATE POLICY "admin_nazer_view_approval_stats" ON public.approval_stats 
FOR SELECT TO authenticated 
USING (is_admin_or_nazer());

-- 4. إصلاح سياسات auto_fix_attempts
ALTER POLICY "Admins can manage auto_fix_attempts" ON public.auto_fix_attempts TO authenticated;

-- 5. إصلاح سياسات backup_logs
DROP POLICY IF EXISTS "المسؤولون يمكنهم عرض سجل النسخ الا" ON public.backup_logs;
CREATE POLICY "admin_view_backup_logs" ON public.backup_logs 
FOR SELECT TO authenticated 
USING (is_admin_or_nazer());

-- 6. إصلاح سياسات bank_accounts
ALTER POLICY "bank_accounts_delete_unified" ON public.bank_accounts TO authenticated;
ALTER POLICY "bank_accounts_insert_unified" ON public.bank_accounts TO authenticated;
ALTER POLICY "bank_accounts_select_staff_only" ON public.bank_accounts TO authenticated;
ALTER POLICY "bank_accounts_update_unified" ON public.bank_accounts TO authenticated;

-- 7. إصلاح سياسات bank_integrations
ALTER POLICY "admin_only_bank_integrations" ON public.bank_integrations TO authenticated;

-- 8. إصلاح سياسات bank_reconciliation_matches
ALTER POLICY "financial_staff_can_read_bank_reconciliation_matches" ON public.bank_reconciliation_matches TO authenticated;
ALTER POLICY "financial_staff_can_update_bank_reconciliation_matches" ON public.bank_reconciliation_matches TO authenticated