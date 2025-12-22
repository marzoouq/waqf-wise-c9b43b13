-- ============================================
-- إصلاح تحذيرات search_path للدوال
-- ============================================

-- إصلاح log_login_attempt
CREATE OR REPLACE FUNCTION log_login_attempt(
  p_email TEXT,
  p_ip_address TEXT,
  p_success BOOLEAN,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.login_attempts_log (user_email, ip_address, success, user_agent, created_at)
  VALUES (p_email, p_ip_address, p_success, p_user_agent, now());
  
  DELETE FROM public.login_attempts_log
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إصلاح create_system_alert_from_error
CREATE OR REPLACE FUNCTION create_system_alert_from_error()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'critical' THEN
    INSERT INTO public.system_alerts (
      title, description, alert_type, severity, source, status, metadata, created_at
    ) VALUES (
      'خطأ حرج في النظام',
      COALESCE(NEW.error_message, 'خطأ غير معروف'),
      'system_error', 'critical',
      COALESCE(NEW.source, 'system'), 'active',
      jsonb_build_object('error_id', NEW.id, 'error_code', NEW.error_code, 'stack_trace', LEFT(NEW.stack_trace, 500)),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إصلاح log_security_event
CREATE OR REPLACE FUNCTION log_security_event()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_description TEXT;
BEGIN
  IF TG_TABLE_NAME = 'user_roles' THEN
    IF TG_OP = 'INSERT' THEN
      v_event_type := 'role_assigned';
      v_description := 'تم تعيين دور جديد للمستخدم';
    ELSIF TG_OP = 'DELETE' THEN
      v_event_type := 'role_removed';
      v_description := 'تم إزالة دور من المستخدم';
    END IF;
  ELSIF TG_TABLE_NAME = 'permissions' THEN
    v_event_type := 'permission_changed';
    v_description := 'تم تغيير الصلاحيات';
  END IF;
  
  INSERT INTO public.security_events_log (
    event_type, description, user_id, ip_address, metadata, created_at
  ) VALUES (
    v_event_type, v_description, COALESCE(auth.uid(), NULL),
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    CASE WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
         WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
         ELSE jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    END,
    now()
  );
  
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إصلاح log_beneficiary_change
CREATE OR REPLACE FUNCTION log_beneficiary_change()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_fields JSONB := '[]'::JSONB;
  v_field TEXT;
  v_old_val TEXT;
  v_new_val TEXT;
BEGIN
  FOREACH v_field IN ARRAY ARRAY['full_name', 'phone', 'email', 'national_id', 'iban', 'status', 'category', 'eligibility_status', 'bank_name'] LOOP
    EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', v_field, v_field) INTO v_old_val, v_new_val USING OLD, NEW;
    IF v_old_val IS DISTINCT FROM v_new_val THEN
      v_changed_fields := v_changed_fields || jsonb_build_object('field', v_field, 'old', v_old_val, 'new', v_new_val);
    END IF;
  END LOOP;
  
  IF jsonb_array_length(v_changed_fields) > 0 THEN
    INSERT INTO public.beneficiary_changes_log (
      beneficiary_id, change_type, changed_by, changed_by_name, old_value, new_value, created_at
    ) VALUES (
      NEW.id, 'update', auth.uid(),
      (SELECT full_name FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),
      v_changed_fields->0->>'old', v_changed_fields->0->>'new', now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إصلاح save_smart_alert
CREATE OR REPLACE FUNCTION save_smart_alert(
  p_alert_type TEXT, p_title TEXT, p_description TEXT, p_severity TEXT,
  p_entity_id UUID, p_entity_type TEXT, p_action_url TEXT
)
RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  SELECT id INTO v_alert_id FROM public.smart_alerts
  WHERE alert_type = p_alert_type AND data->>'entity_id' = p_entity_id::TEXT AND is_dismissed = false;
  
  IF v_alert_id IS NOT NULL THEN
    UPDATE public.smart_alerts SET title = p_title, description = p_description, severity = p_severity, triggered_at = now()
    WHERE id = v_alert_id;
    RETURN v_alert_id;
  ELSE
    INSERT INTO public.smart_alerts (
      alert_type, title, description, severity, data, action_url, is_read, is_dismissed, triggered_at, created_at
    ) VALUES (
      p_alert_type, p_title, p_description, p_severity,
      jsonb_build_object('entity_id', p_entity_id, 'entity_type', p_entity_type),
      p_action_url, false, false, now(), now()
    ) RETURNING id INTO v_alert_id;
    RETURN v_alert_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;