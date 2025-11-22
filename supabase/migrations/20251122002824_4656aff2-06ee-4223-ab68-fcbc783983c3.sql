-- تحسين سياسات RLS للمستفيدين لضمان الشفافية والحوكمة
-- النسخة النهائية - بدون أخطاء

-- ============================================
-- 1. جدول التوزيعات (distributions)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة التوزيعات المعتمدة" ON public.distributions;

CREATE POLICY "المستفيدون يمكنهم قراءة التوزيعات المعتمدة"
ON public.distributions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'cashier'::app_role)
  OR (status = 'معتمد' AND has_role(auth.uid(), 'beneficiary'::app_role))
);

-- ============================================
-- 2. جدول الصناديق (funds)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة معلومات الصناديق" ON public.funds;

CREATE POLICY "المستفيدون يمكنهم قراءة معلومات الصناديق"
ON public.funds
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR (is_active = true AND has_role(auth.uid(), 'beneficiary'::app_role))
);

-- ============================================
-- 3. جدول العقارات (properties)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة معلومات العقارات" ON public.properties;

CREATE POLICY "المستفيدون يمكنهم قراءة معلومات العقارات"
ON public.properties
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'cashier'::app_role)
  OR has_role(auth.uid(), 'beneficiary'::app_role)
);

-- ============================================
-- 4. جدول المدفوعات (payments)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة مدفوعاتهم" ON public.payments;

CREATE POLICY "المستفيدون يمكنهم قراءة مدفوعاتهم"
ON public.payments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'cashier'::app_role)
  OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
);

-- ============================================
-- 5. جدول قرارات الحوكمة (governance_decisions)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة القرارات المعتمدة" ON public.governance_decisions;

CREATE POLICY "المستفيدون يمكنهم قراءة القرارات المعتمدة"
ON public.governance_decisions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR (
    decision_status IN ('معتمد', 'قيد التنفيذ', 'منفذ')
    AND has_role(auth.uid(), 'beneficiary'::app_role)
  )
);

-- ============================================
-- 6. جدول وحدات العقارات (property_units)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة معلومات الوحدات" ON public.property_units;

CREATE POLICY "المستفيدون يمكنهم قراءة معلومات الوحدات"
ON public.property_units
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'beneficiary'::app_role)
);

-- ============================================
-- 7. إعدادات التوزيع (waqf_distribution_settings)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة إعدادات التوزيع" ON public.waqf_distribution_settings;

CREATE POLICY "المستفيدون يمكنهم قراءة إعدادات التوزيع"
ON public.waqf_distribution_settings
FOR SELECT
TO authenticated
USING (
  is_active = true
  OR has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
);

-- ============================================
-- تعليقات توثيقية
-- ============================================

COMMENT ON POLICY "المستفيدون يمكنهم قراءة التوزيعات المعتمدة" ON public.distributions IS 
'✅ الشفافية: المستفيدون يرون التوزيعات المعتمدة للحوكمة الرشيدة';

COMMENT ON POLICY "المستفيدون يمكنهم قراءة معلومات الصناديق" ON public.funds IS 
'✅ الشفافية: المستفيدون يرون معلومات الصناديق النشطة';

COMMENT ON POLICY "المستفيدون يمكنهم قراءة معلومات العقارات" ON public.properties IS 
'✅ الشفافية: المستفيدون يرون معلومات عقارات الوقف';

COMMENT ON POLICY "المستفيدون يمكنهم قراءة القرارات المعتمدة" ON public.governance_decisions IS 
'✅ الحوكمة: المستفيدون يرون القرارات المعتمدة';

COMMENT ON POLICY "المستفيدون يمكنهم قراءة مدفوعاتهم" ON public.payments IS 
'✅ الخصوصية: كل مستفيد يرى مدفوعاته فقط';

COMMENT ON POLICY "المستفيدون يمكنهم قراءة معلومات الوحدات" ON public.property_units IS 
'✅ الشفافية: المستفيدون يرون وحدات العقارات';

COMMENT ON POLICY "المستفيدون يمكنهم قراءة إعدادات التوزيع" ON public.waqf_distribution_settings IS 
'✅ الشفافية: الجميع يرى إعدادات التوزيع النشطة';