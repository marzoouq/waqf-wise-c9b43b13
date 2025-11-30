-- إنشاء دالة لإنشاء الملف الشخصي تلقائياً عند تسجيل مستخدم جديد
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'مستخدم جديد')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- إنشاء trigger لتشغيل الدالة بعد إنشاء مستخدم جديد
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- إضافة comment للتوثيق
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile automatically when a new user signs up';