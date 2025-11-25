-- Phase 1: Fix the critical "Admins can view all roles" policy
-- This replaces the direct subquery (causing recursion) with the safe has_any_role() function
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT
TO public
USING (public.has_any_role(auth.uid(), ARRAY['admin', 'nazer']::app_role[]));


-- Phase 2: Create 9 abbreviated helper functions
-- All functions follow the same secure pattern: SECURITY DEFINER, safe search_path, STABLE

-- 1. Individual role checks
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_nazer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'nazer'::app_role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_accountant()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'accountant'::app_role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_cashier()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'cashier'::app_role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_archivist()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'archivist'::app_role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_beneficiary()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'beneficiary'::app_role
  )
$$;

-- 2. Grouped role checks
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN (
      'admin'::app_role,
      'nazer'::app_role,
      'accountant'::app_role,
      'cashier'::app_role,
      'archivist'::app_role
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.is_financial_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN (
      'admin'::app_role,
      'nazer'::app_role,
      'accountant'::app_role,
      'cashier'::app_role
    )
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_nazer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role)
  )
$$;


-- Phase 3: Grant EXECUTE privileges to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_nazer() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_accountant() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_cashier() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_archivist() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_beneficiary() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_financial_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_nazer() TO authenticated;