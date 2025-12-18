
-- المرحلة 2 و 4: إنشاء دوال محسنة مع plan caching
-- ================================================

-- دالة للتحقق من وارث الوقف
CREATE OR REPLACE FUNCTION public.is_waqf_heir()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'waqf_heir'::app_role
  )
$$;

-- دالة شاملة للتحقق من صلاحية إدارة البيانات
CREATE OR REPLACE FUNCTION public.can_manage_data()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role)
  )
$$;

-- دالة للتحقق من صلاحية نقطة البيع
CREATE OR REPLACE FUNCTION public.is_pos_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role, 'cashier'::app_role)
  )
$$;

-- دالة للتحقق من ملكية تذكرة الدعم
CREATE OR REPLACE FUNCTION public.owns_support_ticket(p_ticket_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.support_tickets st
    WHERE st.id = p_ticket_id
    AND (
      st.user_id = auth.uid()
      OR st.beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
    )
  )
$$;

-- تحديث is_admin مع plan caching
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  )
$$;

-- تحديث is_admin_or_nazer مع plan caching
CREATE OR REPLACE FUNCTION public.is_admin_or_nazer()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role)
  )
$$;

-- تحديث is_financial_staff مع plan caching
CREATE OR REPLACE FUNCTION public.is_financial_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role, 'cashier'::app_role)
  )
$$;

-- تحديث has_staff_access مع plan caching
CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role, 'cashier'::app_role, 'archivist'::app_role)
  )
$$;

-- تحديث has_full_read_access مع plan caching
CREATE OR REPLACE FUNCTION public.has_full_read_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role, 'waqf_heir'::app_role)
  )
$$;

-- تحديث is_staff_only مع plan caching
CREATE OR REPLACE FUNCTION public.is_staff_only()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role, 'cashier'::app_role, 'archivist'::app_role)
  )
$$;

-- تحديث owns_beneficiary مع plan caching
CREATE OR REPLACE FUNCTION public.owns_beneficiary(p_beneficiary_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.beneficiaries b
    WHERE b.id = p_beneficiary_id 
    AND b.user_id = auth.uid()
  )
$$;

-- تحديث is_heir مع plan caching
CREATE OR REPLACE FUNCTION public.is_heir()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'waqf_heir'::app_role
  )
$$;

-- تحديث is_accountant مع plan caching
CREATE OR REPLACE FUNCTION public.is_accountant()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'accountant'::app_role
  )
$$;

-- تحديث is_cashier مع plan caching
CREATE OR REPLACE FUNCTION public.is_cashier()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'cashier'::app_role
  )
$$;

-- تحديث is_archivist مع plan caching
CREATE OR REPLACE FUNCTION public.is_archivist()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'archivist'::app_role
  )
$$;

-- تحديث is_beneficiary
CREATE OR REPLACE FUNCTION public.is_beneficiary()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'beneficiary'::app_role
  )
$$;

-- تحديث has_role مع plan caching
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET plan_cache_mode = force_generic_plan
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
    AND role = _role
  )
$$;
