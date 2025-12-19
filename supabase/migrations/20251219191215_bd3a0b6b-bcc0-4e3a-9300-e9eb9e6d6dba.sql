-- المرحلة 1: تصحيح أرصدة الحسابات المحاسبية
-- تصحيح رصيد إيرادات الإيجار (يجب أن يكون سالباً للإيرادات)
UPDATE accounts 
SET current_balance = -824456.52,
    updated_at = now()
WHERE id = '29dc0878-9fd0-4297-8c78-e4956ceeaaaf';

-- تصحيح رصيد ضريبة القيمة المضافة (يجب أن يكون سالباً للمطلوبات)
UPDATE accounts 
SET current_balance = -125543.48,
    updated_at = now()
WHERE id = '110982aa-b68b-446c-82e1-213598c982de';

-- المرحلة 2: حماية سجلات التدقيق من التعديل والحذف
-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "audit_logs_insert_only" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_update" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_no_delete" ON audit_logs;
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- سياسة القراءة للمدراء فقط
CREATE POLICY "audit_logs_admin_read" ON audit_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- سياسة الإدراج للجميع (للتسجيل)
CREATE POLICY "audit_logs_insert_only" ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- سياسة لمنع التحديث نهائياً
CREATE POLICY "audit_logs_no_update" ON audit_logs
  FOR UPDATE TO authenticated
  USING (false);

-- سياسة لمنع الحذف نهائياً
CREATE POLICY "audit_logs_no_delete" ON audit_logs
  FOR DELETE TO authenticated
  USING (false);

-- المرحلة 3: إنشاء function لتنظيف الصفوف الميتة
CREATE OR REPLACE FUNCTION public.run_vacuum_analyze()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb := '{"tables_analyzed": []}'::jsonb;
  table_name text;
  tables_to_analyze text[] := ARRAY[
    'system_alerts', 'fiscal_years', 'contracts', 'journal_entries',
    'rental_payments', 'beneficiaries', 'project_documentation',
    'heir_distributions', 'contract_units', 'system_health_checks',
    'notifications', 'accounts', 'user_roles', 'families',
    'payments', 'profiles', 'journal_entry_lines', 'audit_logs'
  ];
BEGIN
  -- تشغيل ANALYZE على كل جدول (VACUUM يتم تلقائياً بواسطة autovacuum)
  FOREACH table_name IN ARRAY tables_to_analyze
  LOOP
    BEGIN
      EXECUTE format('ANALYZE %I', table_name);
      result := jsonb_set(
        result, 
        '{tables_analyzed}', 
        (result->'tables_analyzed') || to_jsonb(table_name)
      );
    EXCEPTION WHEN OTHERS THEN
      -- تجاهل الأخطاء للجداول غير الموجودة
      NULL;
    END;
  END LOOP;
  
  RETURN result;
END;
$$;

-- تشغيل ANALYZE الآن
SELECT public.run_vacuum_analyze();

-- إضافة تعليق توضيحي
COMMENT ON FUNCTION public.run_vacuum_analyze() IS 'تنظيف وتحليل الجداول لتحسين الأداء - يمكن تشغيلها دورياً';