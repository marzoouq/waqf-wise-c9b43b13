-- ============================================
-- إصلاح تحذيرات الأمان - إزالة Views المكشوفة
-- ============================================

-- حذف View user_profile_with_roles لأنه يكشف auth.users
DROP VIEW IF EXISTS public.user_profile_with_roles CASCADE;

-- حذف View current_user_roles إذا كان يكشف auth.users
DROP VIEW IF EXISTS public.current_user_roles CASCADE;

-- فحص messages_with_users وإصلاحه إذا لزم الأمر
-- أولاً نعيد إنشاء current_user_roles بشكل آمن كدالة
CREATE OR REPLACE FUNCTION public.get_current_user_roles()
RETURNS TABLE (role text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role::text
  FROM user_roles ur
  WHERE ur.user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.get_current_user_roles() TO authenticated;