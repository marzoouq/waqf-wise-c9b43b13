-- إنشاء جدول users_profiles_cache المفقود
CREATE TABLE IF NOT EXISTS public.users_profiles_cache (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  position TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  user_created_at TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ,
  roles JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.users_profiles_cache ENABLE ROW LEVEL SECURITY;

-- سياسة للموظفين فقط
CREATE POLICY "Staff can view all cache" ON public.users_profiles_cache
FOR SELECT TO authenticated
USING (public.check_is_staff_direct(auth.uid()));

-- الآن تعيين دور للمستخدم الذي ليس لديه دور
INSERT INTO user_roles (user_id, role)
SELECT p.user_id, 'beneficiary'::app_role
FROM profiles p
LEFT JOIN user_roles ur ON p.user_id = ur.user_id
WHERE ur.id IS NULL
ON CONFLICT (user_id, role) DO NOTHING;