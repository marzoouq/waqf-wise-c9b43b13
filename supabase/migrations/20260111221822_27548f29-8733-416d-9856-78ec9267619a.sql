-- =====================================================
-- المرحلة 2: إصلاح bank_transfer_details و audit_logs
-- =====================================================

-- 1. إصلاح سياسة bank_transfer_details - تقييد الوصول
DROP POLICY IF EXISTS "Users can view bank transfer details" ON public.bank_transfer_details;
CREATE POLICY "staff_or_owner_view_bank_transfer_details" ON public.bank_transfer_details 
FOR SELECT TO authenticated 
USING (
  is_financial_staff() OR 
  is_admin_or_nazer() OR
  (beneficiary_id IN (SELECT id FROM public.beneficiaries WHERE user_id = auth.uid()))
);

-- 2. إصلاح سياسات audit_logs
DROP POLICY IF EXISTS "Only admins and system can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "authenticated_insert_own_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_only" ON public.audit_logs;

CREATE POLICY "admin_system_insert_audit_logs" ON public.audit_logs 
FOR INSERT TO authenticated 
WITH CHECK (
  (current_setting('role'::text, true) = 'service_role'::text) OR 
  is_admin_or_nazer() OR
  (user_id = auth.uid())
);

-- 3. إصلاح سياسات bank_statements - إزالة التكرار
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON public.bank_statements;
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم " ON public.bank_statements;

-- 4. تحديث سياسة audit_logs_archive
DROP POLICY IF EXISTS "Only admins can view archive" ON public.audit_logs_archive;
CREATE POLICY "admin_view_audit_logs_archive" ON public.audit_logs_archive 
FOR SELECT TO authenticated 
USING (is_admin_or_nazer());

-- 5. إصلاح سياسات auto_journal_log
ALTER POLICY "financial_staff_can_read_auto_journal_log" ON public.auto_journal_log TO authenticated