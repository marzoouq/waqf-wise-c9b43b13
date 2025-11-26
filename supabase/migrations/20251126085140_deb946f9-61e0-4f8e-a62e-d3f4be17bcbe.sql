-- حذف Functions القديمة إن وجدت
DROP FUNCTION IF EXISTS public.check_user_permission(UUID, TEXT);
DROP FUNCTION IF EXISTS public.grant_user_permission(UUID, TEXT, UUID, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS public.log_audit_event(UUID, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_user_session(UUID, TEXT, TEXT, TEXT, JSONB);
DROP FUNCTION IF EXISTS public.end_user_session(UUID, UUID);

-- Function لتسجيل العمليات تلقائياً
CREATE FUNCTION public.log_audit_event(
  p_user_id UUID,
  p_action_type TEXT,
  p_table_name TEXT,
  p_record_id TEXT,
  p_description TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info',
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id UUID;
  v_user_email TEXT;
BEGIN
  SELECT email INTO v_user_email FROM auth.users WHERE id = p_user_id;

  INSERT INTO public.audit_logs (
    user_id, user_email, action_type, table_name, record_id,
    description, old_values, new_values, severity, ip_address, user_agent
  ) VALUES (
    p_user_id, v_user_email, p_action_type, p_table_name, p_record_id,
    p_description, p_old_values, p_new_values, p_severity, p_ip_address, p_user_agent
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

-- Function لإنشاء جلسة جديدة
CREATE FUNCTION public.create_user_session(
  p_user_id UUID,
  p_session_token TEXT,
  p_ip_address TEXT,
  p_user_agent TEXT,
  p_device_info JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO public.user_sessions (
    user_id, session_token, ip_address, user_agent, device_info,
    is_active, started_at, last_activity_at
  ) VALUES (
    p_user_id, p_session_token, p_ip_address, p_user_agent, p_device_info,
    true, now(), now()
  ) RETURNING id INTO v_session_id;

  UPDATE public.profiles SET last_login_at = now() WHERE user_id = p_user_id;

  PERFORM public.log_audit_event(
    p_user_id, 'login', 'user_sessions', v_session_id::text, 'تسجيل دخول ناجح',
    NULL, jsonb_build_object('ip', p_ip_address), 'info', p_ip_address, p_user_agent
  );

  RETURN v_session_id;
END;
$$;

-- Function لإنهاء جلسة
CREATE FUNCTION public.end_user_session(p_session_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.user_sessions SET is_active = false, ended_at = now()
  WHERE id = p_session_id AND user_id = p_user_id;

  PERFORM public.log_audit_event(
    p_user_id, 'logout', 'user_sessions', p_session_id::text, 'تسجيل خروج',
    NULL, NULL, 'info'
  );

  RETURN true;
END;
$$;

-- Function للتحقق من الصلاحية
CREATE FUNCTION public.check_user_permission(p_user_id UUID, p_permission_key TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM public.user_permissions
    WHERE user_id = p_user_id AND permission_key = p_permission_key
      AND granted = true AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Function لمنح صلاحية
CREATE FUNCTION public.grant_user_permission(
  p_user_id UUID, p_permission_key TEXT, p_granted_by UUID, p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_permission_id UUID;
BEGIN
  IF NOT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id = p_granted_by AND role = 'admin') THEN
    RAISE EXCEPTION 'يجب أن تكون مشرفاً لمنح الصلاحيات';
  END IF;

  INSERT INTO public.user_permissions (user_id, permission_key, granted, granted_by, granted_at, expires_at)
  VALUES (p_user_id, p_permission_key, true, p_granted_by, now(), p_expires_at)
  ON CONFLICT (user_id, permission_key) DO UPDATE SET
    granted = true, granted_by = p_granted_by, granted_at = now(), expires_at = p_expires_at
  RETURNING id INTO v_permission_id;

  PERFORM public.log_audit_event(
    p_granted_by, 'grant_permission', 'user_permissions', v_permission_id::text,
    format('منح صلاحية %s', p_permission_key), NULL,
    jsonb_build_object('user_id', p_user_id, 'permission', p_permission_key), 'warn'
  );

  RETURN v_permission_id;
END;
$$;