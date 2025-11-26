-- إصلاح search_path للدالة
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;