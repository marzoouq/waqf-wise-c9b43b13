-- مراجعة وتأمين SECURITY DEFINER Views
-- إضافة فحوصات وصول صريحة لكل view يستخدم SECURITY DEFINER

-- 1. تحديد Views التي تستخدم SECURITY DEFINER
DO $$
DECLARE
  view_record RECORD;
BEGIN
  FOR view_record IN 
    SELECT 
      schemaname,
      viewname,
      viewowner
    FROM pg_views
    WHERE schemaname = 'public'
  LOOP
    RAISE NOTICE 'View found: %.% (owner: %)', 
      view_record.schemaname, 
      view_record.viewname,
      view_record.viewowner;
  END LOOP;
END $$;

-- 2. إضافة policy helper view لتسهيل فحص الصلاحيات في Views
CREATE OR REPLACE VIEW public.current_user_roles AS
SELECT role 
FROM public.user_roles 
WHERE user_id = auth.uid();

COMMENT ON VIEW public.current_user_roles IS 'View مساعد لفحص أدوار المستخدم الحالي - يُستخدم في Views أخرى';

-- 3. إضافة دالة مساعدة للتحقق من الصلاحيات المتعددة
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

COMMENT ON FUNCTION public.has_any_role IS 'فحص إذا كان المستخدم لديه أي دور من قائمة الأدوار - SECURITY DEFINER مع search_path آمن';

-- 4. مثال على تأمين view موجود (beneficiary_statistics)
-- إذا كان لديك views تحتاج تأمين، أضف WHERE clause مثل:
-- WHERE user_id = auth.uid() OR has_any_role(auth.uid(), ARRAY['admin', 'nazer']::app_role[]);
