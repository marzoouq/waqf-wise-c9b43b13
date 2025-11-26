-- حذف الـ trigger المكرر
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- تعديل دالة handle_new_user لتجنب أخطاء التكرار
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- إدراج profile مع تجنب التكرار
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;