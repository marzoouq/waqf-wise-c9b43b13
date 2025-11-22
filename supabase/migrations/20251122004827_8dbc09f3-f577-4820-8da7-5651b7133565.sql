-- =====================================
-- المرحلة 1: آلية حماية حقوق المستفيدين الـ14
-- =====================================

-- 1.1 دالة محمية للتحقق من المستفيدين من الدرجة الأولى
CREATE OR REPLACE FUNCTION public.is_first_degree_beneficiary(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public', 'pg_temp'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.beneficiaries 
    WHERE user_id = user_uuid 
      AND category = 'الفئة الأولى'
      AND status = 'نشط'
  );
END;
$$;

COMMENT ON FUNCTION public.is_first_degree_beneficiary IS 
'🔒 دالة محمية للتحقق من كون المستخدم مستفيد من الدرجة الأولى - لا تعدل هذه الدالة';

-- 1.2 جدول توثيق السياسات المحمية
CREATE TABLE IF NOT EXISTS public.protected_policies_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  policy_name TEXT NOT NULL,
  policy_description TEXT NOT NULL,
  protection_level TEXT NOT NULL CHECK (protection_level IN ('critical', 'high', 'medium')),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  last_verified_at TIMESTAMPTZ DEFAULT now(),
  verification_notes TEXT,
  UNIQUE(table_name, policy_name)
);

COMMENT ON TABLE public.protected_policies_log IS 
'📋 سجل توثيق السياسات المحمية - يوثق حقوق المستفيدين من الدرجة الأولى';

-- Enable RLS
ALTER TABLE public.protected_policies_log ENABLE ROW LEVEL SECURITY;

-- سياسة قراءة للمدراء والناظر
CREATE POLICY "admin_nazer_read_protected_log"
ON public.protected_policies_log FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'nazer')
);

-- إدراج توثيق السياسات الحالية للمستفيدين من الدرجة الأولى (الأسماء الصحيحة)
INSERT INTO public.protected_policies_log (table_name, policy_name, policy_description, protection_level)
VALUES
  ('accounts', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة الحسابات المحاسبية', 'critical'),
  ('journal_entries', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة القيود اليومية', 'critical'),
  ('bank_accounts', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة الحسابات البنكية', 'critical'),
  ('bank_statements', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة كشوفات البنك', 'critical'),
  ('bank_transactions', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة المعاملات البنكية', 'critical'),
  ('properties', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة العقارات', 'critical'),
  ('contracts', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة العقود', 'critical'),
  ('distributions', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة التوزيعات', 'critical'),
  ('funds', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة الصناديق', 'critical'),
  ('rental_payments', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة مدفوعات الإيجار', 'critical'),
  ('governance_decisions', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة قرارات الحوكمة', 'critical'),
  ('waqf_distribution_settings', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة إعدادات التوزيع', 'critical'),
  ('budgets', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة الميزانيات', 'critical'),
  ('cash_flows', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة التدفقات النقدية', 'critical'),
  ('fiscal_years', 'first_degree_read', 'المستفيدون من الدرجة الأولى - قراءة السنوات المالية', 'critical')
ON CONFLICT (table_name, policy_name) DO NOTHING;

-- 1.3 دالة لمنع حذف السياسات المحمية
CREATE OR REPLACE FUNCTION public.prevent_protected_policy_deletion()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type = 'policy' THEN
      -- التحقق من أن السياسة محمية
      IF obj.object_identity LIKE '%first_degree%' 
         OR obj.object_identity LIKE '%الفئة الأولى%' THEN
        RAISE EXCEPTION '🔒 لا يمكن حذف سياسة محمية تخص المستفيدين من الدرجة الأولى: %', 
                        obj.object_identity
        USING HINT = 'هذه السياسة محمية بموجب حقوق المستفيدين الـ14 من الدرجة الأولى';
      END IF;
    END IF;
  END LOOP;
END;
$$;

-- إنشاء Event Trigger للحماية
DROP EVENT TRIGGER IF EXISTS protect_first_degree_policies;
CREATE EVENT TRIGGER protect_first_degree_policies
  ON sql_drop
  EXECUTE FUNCTION public.prevent_protected_policy_deletion();

COMMENT ON EVENT TRIGGER protect_first_degree_policies IS 
'🛡️ حماية سياسات المستفيدين من الدرجة الأولى من الحذف غير المصرح به';

-- =====================================
-- المرحلة 2: إصلاح السياسات الأمنية الحرجة
-- =====================================

-- 2.1 إصلاح performance_metrics - بيانات حساسة جداً
DROP POLICY IF EXISTS "Allow public read access" ON public.performance_metrics;

CREATE POLICY "admin_nazer_accountant_read_metrics"
ON public.performance_metrics FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'nazer') OR
  public.has_role(auth.uid(), 'accountant')
);

-- 2.2 إصلاح auto_fix_attempts - استراتيجيات معالجة الأخطاء
DROP POLICY IF EXISTS "Everyone can view auto-fix attempts" ON public.auto_fix_attempts;

CREATE POLICY "admin_only_view_autofix"
ON public.auto_fix_attempts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2.3 إصلاح alert_rules - قواعد التنبيهات الأمنية
DROP POLICY IF EXISTS "Everyone can view active alert rules" ON public.alert_rules;

CREATE POLICY "admin_only_view_alert_rules"
ON public.alert_rules FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2.4 إصلاح tasks - المهام الداخلية
DROP POLICY IF EXISTS "Users can view tasks assigned to them" ON public.tasks;

CREATE POLICY "staff_only_view_tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'nazer') OR
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'cashier')
);

-- 2.5 إضافة سياسة للمستفيدين على waqf_nazers (شفافية)
CREATE POLICY "first_degree_read_nazers"
ON public.waqf_nazers FOR SELECT
TO authenticated
USING (
  public.is_first_degree_beneficiary(auth.uid()) OR
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'nazer') OR
  public.has_role(auth.uid(), 'accountant')
);

-- إضافة إلى سجل السياسات المحمية
INSERT INTO public.protected_policies_log (table_name, policy_name, policy_description, protection_level)
VALUES ('waqf_nazers', 'first_degree_read_nazers', 'المستفيدون من الدرجة الأولى - قراءة معلومات الناظر', 'critical')
ON CONFLICT (table_name, policy_name) DO NOTHING;

-- =====================================
-- تحسينات الأداء
-- =====================================

-- تحسين indexes لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_beneficiaries_category_status 
ON public.beneficiaries(category, status) 
WHERE status = 'نشط';

CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id_category 
ON public.beneficiaries(user_id, category) 
WHERE status = 'نشط';