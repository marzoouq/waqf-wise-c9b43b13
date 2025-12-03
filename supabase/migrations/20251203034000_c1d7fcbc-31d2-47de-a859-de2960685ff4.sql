-- =====================================================
-- المرحلة 8 (إكمال): سياسات الجداول المتبقية
-- =====================================================

-- 1. تحسين سياسات user_roles
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin manage roles" ON public.user_roles;

CREATE POLICY "Users view own roles v2"
ON public.user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_admin_or_nazer());

CREATE POLICY "Admin manage roles v2"
ON public.user_roles FOR ALL
TO authenticated
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

-- 2. تحسين سياسات notifications
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System create notifications" ON public.notifications;

CREATE POLICY "Users view own notifications v2"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "System create notifications v2"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. تحسين سياسات support_tickets
DROP POLICY IF EXISTS "Users view own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Staff view assigned tickets" ON public.support_tickets;

CREATE POLICY "Users view own tickets v2"
ON public.support_tickets FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR 
  assigned_to = auth.uid() OR 
  public.is_admin_or_nazer()
);

CREATE POLICY "Users create tickets"
ON public.support_tickets FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff manage tickets"
ON public.support_tickets FOR UPDATE
TO authenticated
USING (assigned_to = auth.uid() OR public.is_admin_or_nazer())
WITH CHECK (true);