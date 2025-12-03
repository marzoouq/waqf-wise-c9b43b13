-- =====================================================
-- المرحلة 8: تعزيز أمان سياسات RLS
-- =====================================================

-- 1. إصلاح سياسات profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_nazer() OR public.is_staff_only());

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 2. إصلاح سياسات user_sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.user_sessions;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.user_sessions;

CREATE POLICY "Users view own sessions"
ON public.user_sessions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users manage own sessions"
ON public.user_sessions FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. إصلاح سياسات internal_messages
DROP POLICY IF EXISTS "Users can view own messages" ON public.internal_messages;
DROP POLICY IF EXISTS "Users can send messages" ON public.internal_messages;

CREATE POLICY "Users view own messages"
ON public.internal_messages FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users send messages"
ON public.internal_messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users update own sent messages"
ON public.internal_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- 4. إصلاح سياسات two_factor_auth
DROP POLICY IF EXISTS "Users manage own 2FA" ON public.two_factor_auth;

CREATE POLICY "Users view own 2FA"
ON public.two_factor_auth FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users manage own 2FA"
ON public.two_factor_auth FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 5. إصلاح سياسات two_factor_secrets
DROP POLICY IF EXISTS "Users manage own 2FA secrets" ON public.two_factor_secrets;

CREATE POLICY "Users view own 2FA secrets"
ON public.two_factor_secrets FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users manage own 2FA secrets"
ON public.two_factor_secrets FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. تحسين سياسات contracts للموظفين فقط
DROP POLICY IF EXISTS "Staff can view contracts" ON public.contracts;
DROP POLICY IF EXISTS "Staff can manage contracts" ON public.contracts;

CREATE POLICY "Staff view contracts"
ON public.contracts FOR SELECT
TO authenticated
USING (public.is_staff_only() OR public.is_admin_or_nazer());

CREATE POLICY "Staff manage contracts"
ON public.contracts FOR ALL
TO authenticated
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

-- 7. تحسين سياسات distributions
DROP POLICY IF EXISTS "Beneficiaries view own distributions" ON public.distributions;
DROP POLICY IF EXISTS "Staff view all distributions" ON public.distributions;

CREATE POLICY "View distributions"
ON public.distributions FOR SELECT
TO authenticated
USING (
  public.is_staff_only() OR 
  public.is_admin_or_nazer() OR
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'waqf_heir'
  )
);

CREATE POLICY "Staff manage distributions"
ON public.distributions FOR ALL
TO authenticated
USING (public.is_admin_or_nazer() OR public.is_accountant())
WITH CHECK (public.is_admin_or_nazer() OR public.is_accountant());