-- ============================================
-- المرحلة 1: إعادة بناء جدول profiles
-- ============================================

-- إدخال profiles لجميع المستخدمين الموجودين في auth.users
INSERT INTO profiles (id, user_id, email, full_name, created_at, updated_at)
SELECT 
  gen_random_uuid() as id,
  au.id as user_id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    b.full_name,
    SPLIT_PART(au.email, '@', 1),
    'مستخدم'
  ) as full_name,
  au.created_at,
  now() as updated_at
FROM auth.users au
LEFT JOIN beneficiaries b ON b.user_id = au.id
WHERE NOT EXISTS (
  SELECT 1 FROM profiles p WHERE p.user_id = au.id
)
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- المرحلة 2: إصلاح trigger handle_new_user
-- ============================================

-- تحديث الدالة لتكون SECURITY DEFINER مع معالجة الأخطاء
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      SPLIT_PART(NEW.email, '@', 1),
      'مستخدم جديد'
    ),
    NEW.created_at,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(profiles.full_name, ''), EXCLUDED.full_name),
    updated_at = now();
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- التأكد من وجود الـ trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- المرحلة 3: تحديث View user_profile_with_roles
-- ============================================

-- حذف الـ View القديم وإعادة إنشائه مع دعم fallback
DROP VIEW IF EXISTS public.user_profile_with_roles;

CREATE VIEW public.user_profile_with_roles AS
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
  p.position,
  COALESCE(p.user_id, au.id) as user_id,
  (
    SELECT COALESCE(json_agg(json_build_object('role', ur.role)), '[]'::json)
    FROM user_roles ur
    WHERE ur.user_id = COALESCE(p.user_id, au.id)
  ) AS user_roles
FROM auth.users au
LEFT JOIN profiles p ON p.user_id = au.id;

-- منح الصلاحيات للـ View
GRANT SELECT ON public.user_profile_with_roles TO authenticated;
GRANT SELECT ON public.user_profile_with_roles TO anon;