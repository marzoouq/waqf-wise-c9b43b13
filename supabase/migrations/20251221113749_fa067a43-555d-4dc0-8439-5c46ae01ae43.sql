-- المرحلة 1.1: تحسين سياسة audit_logs
-- حذف السياسة المفتوحة وإنشاء سياسة آمنة مرتبطة بـ auth.uid()
DROP POLICY IF EXISTS audit_logs_insert_only ON public.audit_logs;

CREATE POLICY "authenticated_insert_own_logs" ON public.audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR
    user_id IS NULL  -- للسجلات التلقائية من triggers
  );

-- المرحلة 1.2: حذف السياسات المفتوحة من 4 جداول
-- السياسات الآمنة موجودة بالفعل في هذه الجداول

-- 1. contract_units - حذف السياسة المفتوحة (staff_manage_contract_units موجودة)
DROP POLICY IF EXISTS allow_insert_contract_units ON public.contract_units;

-- 2. dashboard_widgets - حذف السياسة المفتوحة (users_manage_widgets موجودة)
DROP POLICY IF EXISTS "Allow insert widgets" ON public.dashboard_widgets;

-- 3. document_versions - حذف السياسة المفتوحة (staff_document_versions موجودة)
DROP POLICY IF EXISTS document_versions_insert_policy ON public.document_versions;

-- 4. organization_settings - حذف السياسة المفتوحة (admin_nazer_manage_org_settings موجودة)
DROP POLICY IF EXISTS "Allow authenticated insert on organization_settings" ON public.organization_settings;