-- =====================================================
-- إصلاحات RLS الشاملة - المراحل 9-12 (مُصحَّح)
-- =====================================================

-- 1. إصلاح سياسة translations المفتوحة
-- =====================================================
DROP POLICY IF EXISTS "Everyone can read translations" ON public.translations;

CREATE POLICY "Authenticated users can read translations"
ON public.translations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage translations"
ON public.translations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- 2. إضافة سياسات إدارة للجداول الناقصة
-- =====================================================

-- 2.1 جدول activities
CREATE POLICY "Admins can manage activities"
ON public.activities
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- 2.2 جدول chatbot_quick_replies
CREATE POLICY "Admins can manage chatbot_quick_replies"
ON public.chatbot_quick_replies
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- 2.3 جدول roles
CREATE POLICY "Admins can manage roles"
ON public.roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- 2.4 جدول security_sessions
CREATE POLICY "Admins can manage security_sessions"
ON public.security_sessions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'
  )
);

-- 2.5 جدول support_escalations
CREATE POLICY "Support staff can manage escalations"
ON public.support_escalations
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- 3. توحيد سياسات payments المكررة
-- =====================================================
DROP POLICY IF EXISTS "Accountants and admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Financial staff can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Staff can view all payments" ON public.payments;

-- إنشاء سياسة موحدة للقراءة (بدون waqf_admin)
CREATE POLICY "payments_select_unified"
ON public.payments
FOR SELECT
TO authenticated
USING (
  -- المستفيد يرى دفعاته فقط
  beneficiary_id IN (
    SELECT id FROM public.beneficiaries WHERE user_id = auth.uid()
  )
  OR
  -- الموظفون الماليون يرون الكل
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- 4. توحيد سياسات waqf_distribution_settings المكررة
-- =====================================================
DROP POLICY IF EXISTS "Admins can do everything" ON public.waqf_distribution_settings;
DROP POLICY IF EXISTS "Admins can manage distribution settings" ON public.waqf_distribution_settings;
DROP POLICY IF EXISTS "Nazer and admins can manage settings" ON public.waqf_distribution_settings;

CREATE POLICY "waqf_distribution_settings_manage_unified"
ON public.waqf_distribution_settings
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer')
  )
);

-- 5. توحيد سياسات distribution_details المكررة
-- =====================================================
DROP POLICY IF EXISTS "Admins and Nazer can manage all distribution details" ON public.distribution_details;
DROP POLICY IF EXISTS "Authorized staff can manage distribution details" ON public.distribution_details;

CREATE POLICY "distribution_details_manage_unified"
ON public.distribution_details
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- 6. توحيد سياسات distributions المكررة
-- =====================================================
DROP POLICY IF EXISTS "Admins and Nazer can manage distributions" ON public.distributions;
DROP POLICY IF EXISTS "Authorized staff can manage distributions" ON public.distributions;

CREATE POLICY "distributions_manage_unified"
ON public.distributions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant')
  )
);

-- 7. إضافة تعليقات توثيقية
-- =====================================================
COMMENT ON POLICY "Authenticated users can read translations" ON public.translations IS 'يسمح للمستخدمين المصادقين بقراءة الترجمات';
COMMENT ON POLICY "payments_select_unified" ON public.payments IS 'سياسة موحدة للقراءة - تجمع 3 سياسات';
COMMENT ON POLICY "waqf_distribution_settings_manage_unified" ON public.waqf_distribution_settings IS 'سياسة موحدة للإدارة';
COMMENT ON POLICY "distribution_details_manage_unified" ON public.distribution_details IS 'سياسة موحدة للإدارة';
COMMENT ON POLICY "distributions_manage_unified" ON public.distributions IS 'سياسة موحدة للإدارة';