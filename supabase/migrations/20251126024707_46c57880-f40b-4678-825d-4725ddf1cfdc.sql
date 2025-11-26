-- إصلاح infinite recursion - خطوة بخطوة

-- 1. حذف جميع policies المتعلقة بـ roles
DROP POLICY IF EXISTS "admins_can_manage_roles" ON public.roles;
DROP POLICY IF EXISTS "users_can_view_roles" ON public.roles;
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.roles;

-- 2. حذف policies المتعلقة بـ user_permissions
DROP POLICY IF EXISTS "admins_can_manage_permissions" ON public.user_permissions;
DROP POLICY IF EXISTS "users_can_view_their_permissions" ON public.user_permissions;

-- 3. الآن نحذف العمود role_id من profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role_id CASCADE;

-- 4. إنشاء policies جديدة بسيطة لـ roles (بدون recursion)
CREATE POLICY "Authenticated users can view roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. policies لـ profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "users_can_insert_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_update_profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- 6. إنشاء view للمستخدمين مع أدوارهم
CREATE OR REPLACE VIEW public.user_profile_with_roles AS
SELECT 
  p.*,
  COALESCE(
    (
      SELECT json_agg(ur.role)
      FROM public.user_roles ur
      WHERE ur.user_id = p.id
    ),
    '[]'::json
  ) as roles
FROM public.profiles p;