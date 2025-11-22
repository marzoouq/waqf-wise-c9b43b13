-- ==========================================
-- إصلاح ثغرات RLS الحرجة - النسخة المصححة
-- Critical RLS Security Fixes - Corrected Version
-- ==========================================

-- 1. إصلاح policy جدول المستفيدين - منع المستفيدين من رؤية بعضهم
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية بياناتهم فقط" ON public.beneficiaries;

CREATE POLICY "المستفيدون يمكنهم رؤية بياناتهم فقط" 
ON public.beneficiaries 
FOR SELECT 
TO authenticated
USING (
  -- المستفيد يرى بياناته فقط
  user_id = auth.uid()
  OR
  -- أو لديه أحد الأدوار الإدارية
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'accountant')
  OR public.has_role(auth.uid(), 'cashier')
);

-- 2. إصلاح policy جدول العقود - تقييد الوصول
DROP POLICY IF EXISTS "Authenticated users can view contracts" ON public.contracts;

CREATE POLICY "Staff can view contracts"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'accountant')
);

-- 3. إصلاح policy جدول الوحدات العقارية - تقييد الوصول
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة الوحدات" ON public.property_units;

CREATE POLICY "Staff can view property units"
ON public.property_units
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'accountant')
);

-- 4. إصلاح policy إعدادات النظام - تقييد الوصول
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة إعدادات النظام" ON public.system_settings;

CREATE POLICY "Only admins and nazer can view system settings"
ON public.system_settings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'nazer')
);

-- 5. إصلاح policy جدول الصناديق - تقييد الوصول
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة الصناديق" ON public.funds;

CREATE POLICY "Beneficiaries and staff can view funds"
ON public.funds
FOR SELECT
TO authenticated
USING (
  -- الموظفون المصرح لهم
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'accountant')
  OR
  -- أو المستفيد الذي له علاقة بالصندوق
  EXISTS (
    SELECT 1 FROM public.beneficiaries
    WHERE beneficiaries.user_id = auth.uid()
  )
);

-- 6. إصلاح policy إعدادات التوزيع - تقييد الوصول
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة إعدادات التوزيع" ON public.waqf_distribution_settings;

CREATE POLICY "Staff and beneficiaries can view distribution settings"
ON public.waqf_distribution_settings
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'accountant')
  OR
  -- المستفيدون يمكنهم رؤية الإعدادات العامة
  EXISTS (
    SELECT 1 FROM public.beneficiaries
    WHERE beneficiaries.user_id = auth.uid()
  )
);

-- 7. تقييد الوصول لجدول الحسابات البنكية
DROP POLICY IF EXISTS "Bank accounts are viewable by authenticated users" ON public.bank_accounts;

CREATE POLICY "Only financial staff can view bank accounts"
ON public.bank_accounts
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'accountant')
  OR public.has_role(auth.uid(), 'cashier')
);

-- 8. تقييد الوصول لجدول المدفوعات الإيجارية
DROP POLICY IF EXISTS "Authenticated users can view rental payments" ON public.rental_payments;

CREATE POLICY "Only financial staff can view rental payments"
ON public.rental_payments
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'accountant')
);

-- 9. تقييد الوصول لجدول القيود اليومية
DROP POLICY IF EXISTS "Authenticated users can view journal entries" ON public.journal_entries;

CREATE POLICY "Only financial staff can view journal entries"
ON public.journal_entries
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'accountant')
);

-- 10. إضافة تعليقات توثيقية
COMMENT ON TABLE public.beneficiaries IS 'جدول المستفيدين - محمي بـ RLS - يحتوي على بيانات حساسة جداً (هوية، حساب بنكي، دخل)';
COMMENT ON TABLE public.contracts IS 'جدول العقود - محمي بـ RLS - يحتوي على بيانات شخصية ومالية للمستأجرين';
COMMENT ON TABLE public.property_units IS 'جدول الوحدات العقارية - محمي بـ RLS - يحتوي على بيانات مالية حساسة';