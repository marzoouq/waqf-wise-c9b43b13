-- =====================================================
-- المرحلة 8 (تكملة): تعزيز أمان الجداول المالية والحساسة
-- =====================================================

-- 1. إنشاء دالة للتحقق من ملكية المستفيد
CREATE OR REPLACE FUNCTION public.is_beneficiary_owner(_beneficiary_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.beneficiaries
    WHERE id = _beneficiary_id
    AND user_id = auth.uid()
  )
$$;

-- 2. تحسين سياسات beneficiaries
DROP POLICY IF EXISTS "Beneficiaries view own data" ON public.beneficiaries;
DROP POLICY IF EXISTS "Staff view all beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Waqf heirs view all" ON public.beneficiaries;

CREATE POLICY "Beneficiaries and staff view"
ON public.beneficiaries FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  public.is_staff_only() OR 
  public.is_admin_or_nazer() OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir')
);

CREATE POLICY "Staff manage beneficiaries"
ON public.beneficiaries FOR ALL
TO authenticated
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

-- 3. تحسين سياسات payments
DROP POLICY IF EXISTS "Beneficiaries view own payments" ON public.payments;
DROP POLICY IF EXISTS "Staff view all payments" ON public.payments;

CREATE POLICY "View payments"
ON public.payments FOR SELECT
TO authenticated
USING (
  public.is_staff_only() OR 
  public.is_admin_or_nazer() OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir') OR
  EXISTS (
    SELECT 1 FROM public.beneficiaries b 
    WHERE b.id = payments.beneficiary_id AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Staff manage payments"
ON public.payments FOR ALL
TO authenticated
USING (public.is_financial_staff())
WITH CHECK (public.is_financial_staff());

-- 4. تحسين سياسات loans
DROP POLICY IF EXISTS "Beneficiaries view own loans" ON public.loans;
DROP POLICY IF EXISTS "Staff view all loans" ON public.loans;

CREATE POLICY "View loans"
ON public.loans FOR SELECT
TO authenticated
USING (
  public.is_staff_only() OR 
  public.is_admin_or_nazer() OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir') OR
  EXISTS (
    SELECT 1 FROM public.beneficiaries b 
    WHERE b.id = loans.beneficiary_id AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Staff manage loans"
ON public.loans FOR ALL
TO authenticated
USING (public.is_financial_staff())
WITH CHECK (public.is_financial_staff());

-- 5. تحسين سياسات emergency_aid_requests
DROP POLICY IF EXISTS "Beneficiaries view own emergency aid" ON public.emergency_aid_requests;
DROP POLICY IF EXISTS "Staff view all emergency aid" ON public.emergency_aid_requests;

CREATE POLICY "View emergency aid"
ON public.emergency_aid_requests FOR SELECT
TO authenticated
USING (
  public.is_staff_only() OR 
  public.is_admin_or_nazer() OR
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'waqf_heir') OR
  EXISTS (
    SELECT 1 FROM public.beneficiaries b 
    WHERE b.id = emergency_aid_requests.beneficiary_id AND b.user_id = auth.uid()
  )
);

CREATE POLICY "Beneficiaries create emergency aid"
ON public.emergency_aid_requests FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.beneficiaries b 
    WHERE b.id = emergency_aid_requests.beneficiary_id AND b.user_id = auth.uid()
  ) OR public.is_staff_only()
);

CREATE POLICY "Staff manage emergency aid"
ON public.emergency_aid_requests FOR UPDATE
TO authenticated
USING (public.is_staff_only())
WITH CHECK (public.is_staff_only());

-- 6. تحسين سياسات bank_accounts (للموظفين الماليين فقط)
DROP POLICY IF EXISTS "Financial staff view bank accounts" ON public.bank_accounts;
DROP POLICY IF EXISTS "Financial staff manage bank accounts" ON public.bank_accounts;

CREATE POLICY "Financial staff view bank accounts"
ON public.bank_accounts FOR SELECT
TO authenticated
USING (public.is_financial_staff() OR public.is_admin_or_nazer());

CREATE POLICY "Admin manage bank accounts"
ON public.bank_accounts FOR ALL
TO authenticated
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());