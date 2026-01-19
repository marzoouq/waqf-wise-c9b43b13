-- ============================================
-- إصلاح تحذيرات الأمان - مع تغيير اسم العمود المحجوز
-- ============================================

-- إنشاء دالة SECURITY DEFINER آمنة لجلب بيانات المستخدمين
CREATE OR REPLACE FUNCTION public.get_all_user_profiles()
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  is_active boolean,
  last_login_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  user_position text,
  user_id uuid,
  user_roles json
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(p.id, gen_random_uuid()) as id,
    COALESCE(p.full_name, SPLIT_PART(au.email, '@', 1), 'مستخدم') as full_name,
    COALESCE(p.email, au.email) as email,
    p.phone,
    p.avatar_url,
    COALESCE(p.is_active, true) as is_active,
    p.last_login_at,
    COALESCE(p.created_at, au.created_at) as created_at,
    p.updated_at,
    p.position as user_position,
    COALESCE(p.user_id, au.id) as user_id,
    (
      SELECT COALESCE(json_agg(json_build_object('role', ur.role)), '[]'::json)
      FROM user_roles ur
      WHERE ur.user_id = COALESCE(p.user_id, au.id)
    ) AS user_roles
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id;
$$;

-- إنشاء دالة للحصول على مستخدم واحد بالـ ID
CREATE OR REPLACE FUNCTION public.get_user_profile_by_id(_user_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  is_active boolean,
  last_login_at timestamptz,
  created_at timestamptz,
  updated_at timestamptz,
  user_position text,
  user_id uuid,
  user_roles json
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    COALESCE(p.id, gen_random_uuid()) as id,
    COALESCE(p.full_name, SPLIT_PART(au.email, '@', 1), 'مستخدم') as full_name,
    COALESCE(p.email, au.email) as email,
    p.phone,
    p.avatar_url,
    COALESCE(p.is_active, true) as is_active,
    p.last_login_at,
    COALESCE(p.created_at, au.created_at) as created_at,
    p.updated_at,
    p.position as user_position,
    COALESCE(p.user_id, au.id) as user_id,
    (
      SELECT COALESCE(json_agg(json_build_object('role', ur.role)), '[]'::json)
      FROM user_roles ur
      WHERE ur.user_id = au.id
    ) AS user_roles
  FROM auth.users au
  LEFT JOIN profiles p ON p.user_id = au.id
  WHERE au.id = _user_id;
$$;

-- منح صلاحيات الاستخدام
GRANT EXECUTE ON FUNCTION public.get_all_user_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_profile_by_id(uuid) TO authenticated;