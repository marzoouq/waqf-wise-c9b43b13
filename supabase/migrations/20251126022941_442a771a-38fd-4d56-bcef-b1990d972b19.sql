-- المرحلة 13: نظام المستخدمين والأدوار (RBAC) - إصلاح

-- إنشاء جدول الأدوار
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name TEXT NOT NULL UNIQUE,
  role_name_ar TEXT NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '[]'::jsonb,
  is_system_role BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إدراج الأدوار الأساسية
INSERT INTO public.roles (role_name, role_name_ar, description, is_system_role, permissions) VALUES
('nazer', 'الناظر', 'صاحب القرار والموافقات النهائية على كل العمليات', true, '["*"]'::jsonb),
('admin', 'المشرف', 'إدارة النظام والمستخدمين والإعدادات', true, '["users.manage", "settings.manage", "reports.view", "beneficiaries.manage", "properties.manage", "funds.manage", "accounting.manage"]'::jsonb),
('accountant', 'المحاسب', 'تسجيل القيود المالية وإعداد التقارير', true, '["accounting.manage", "journal_entries.create", "reports.view", "bank_accounts.view"]'::jsonb),
('disbursement_officer', 'موظف الصرف', 'تنفيذ صرف المستحقات وتحضير مستندات الدفع', true, '["payments.execute", "vouchers.create", "beneficiaries.view"]'::jsonb),
('archivist', 'أرشيفي', 'إدارة المرفقات والأرشيف دون صلاحيات مالية', true, '["documents.manage", "archive.manage", "beneficiaries.view"]'::jsonb),
('beneficiary', 'مستفيد', 'وصول محدود للملف الشخصي وتقديم الطلبات', true, '["profile.view", "requests.submit", "documents.upload"]'::jsonb)
ON CONFLICT (role_name) DO NOTHING;

-- إضافة عمود role_id لجدول profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'role_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN role_id UUID REFERENCES public.roles(id);
    CREATE INDEX idx_profiles_role_id ON public.profiles(role_id);
    
    UPDATE public.profiles 
    SET role_id = (SELECT id FROM public.roles WHERE role_name = 'beneficiary' LIMIT 1)
    WHERE role_id IS NULL;
  END IF;
END $$;

-- حذف جدول user_permissions القديم وإعادة إنشائه
DROP TABLE IF EXISTS public.user_permissions CASCADE;

CREATE TABLE public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  granted BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES public.profiles(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, permission_key)
);

CREATE INDEX idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission_key ON public.user_permissions(permission_key);

-- إنشاء جدول الجلسات
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  ip_address TEXT,
  user_agent TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_token ON public.user_sessions(session_token);

-- دالة للتحقق من الصلاحيات
CREATE OR REPLACE FUNCTION public.check_user_permission(
  p_user_id UUID,
  p_permission TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role_permissions JSONB;
  v_has_permission BOOLEAN;
BEGIN
  SELECT r.permissions INTO v_role_permissions
  FROM public.roles r
  JOIN public.profiles p ON p.role_id = r.id
  WHERE p.id = p_user_id;
  
  IF v_role_permissions @> '["*"]'::jsonb THEN
    RETURN true;
  END IF;
  
  IF v_role_permissions @> jsonb_build_array(p_permission) THEN
    RETURN true;
  END IF;
  
  SELECT granted INTO v_has_permission
  FROM public.user_permissions
  WHERE user_id = p_user_id
    AND permission_key = p_permission
    AND (expires_at IS NULL OR expires_at > now());
  
  RETURN COALESCE(v_has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تفعيل RLS
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- سياسات الأدوار
DROP POLICY IF EXISTS "everyone_can_read_roles" ON public.roles;
CREATE POLICY "everyone_can_read_roles"
  ON public.roles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "admins_can_manage_roles" ON public.roles;
CREATE POLICY "admins_can_manage_roles"
  ON public.roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid()
      AND r.role_name IN ('nazer', 'admin')
    )
  );

-- سياسات الصلاحيات
DROP POLICY IF EXISTS "users_can_read_their_permissions" ON public.user_permissions;
CREATE POLICY "users_can_read_their_permissions"
  ON public.user_permissions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "admins_can_manage_permissions" ON public.user_permissions;
CREATE POLICY "admins_can_manage_permissions"
  ON public.user_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.roles r ON r.id = p.role_id
      WHERE p.id = auth.uid()
      AND r.role_name IN ('nazer', 'admin')
    )
  );

-- سياسات الجلسات
DROP POLICY IF EXISTS "users_can_read_their_sessions" ON public.user_sessions;
CREATE POLICY "users_can_read_their_sessions"
  ON public.user_sessions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "users_can_create_sessions" ON public.user_sessions;
CREATE POLICY "users_can_create_sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "users_can_update_sessions" ON public.user_sessions;
CREATE POLICY "users_can_update_sessions"
  ON public.user_sessions FOR UPDATE
  USING (user_id = auth.uid());