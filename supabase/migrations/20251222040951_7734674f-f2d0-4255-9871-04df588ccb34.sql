-- ============================================
-- إصلاح الجداول الحرجة الفارغة - المحاولة 2
-- Fix Critical Empty Tables - Phase 8 v2
-- ============================================

-- ==============================
-- 1. إصلاح دالة log_login_attempt
-- ==============================
CREATE OR REPLACE FUNCTION log_login_attempt(
  p_email TEXT,
  p_ip_address TEXT,
  p_success BOOLEAN,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO login_attempts_log (user_email, ip_address, success, user_agent, created_at)
  VALUES (p_email, p_ip_address, p_success, p_user_agent, now());
  
  DELETE FROM login_attempts_log
  WHERE created_at < now() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================
-- 2. Trigger لإنشاء تنبيهات النظام من الأخطاء
-- ==============================
CREATE OR REPLACE FUNCTION create_system_alert_from_error()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'critical' THEN
    INSERT INTO system_alerts (
      title,
      description,
      alert_type,
      severity,
      source,
      status,
      metadata,
      created_at
    ) VALUES (
      'خطأ حرج في النظام',
      COALESCE(NEW.error_message, 'خطأ غير معروف'),
      'system_error',
      'critical',
      COALESCE(NEW.source, 'system'),
      'active',
      jsonb_build_object(
        'error_id', NEW.id,
        'error_code', NEW.error_code,
        'stack_trace', LEFT(NEW.stack_trace, 500)
      ),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_system_alert_from_error ON system_error_logs;
CREATE TRIGGER trigger_system_alert_from_error
  AFTER INSERT ON system_error_logs
  FOR EACH ROW
  WHEN (NEW.severity = 'critical')
  EXECUTE FUNCTION create_system_alert_from_error();

-- ==============================
-- 3. Trigger لتسجيل أحداث الأمان
-- ==============================
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
  
  INSERT INTO security_events_log (
    event_type,
    description,
    user_id,
    ip_address,
    metadata,
    created_at
  ) VALUES (
    v_event_type,
    v_description,
    COALESCE(auth.uid(), NULL),
    current_setting('request.headers', true)::json->>'x-forwarded-for',
    CASE 
      WHEN TG_OP = 'INSERT' THEN to_jsonb(NEW)
      WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD)
      ELSE jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW))
    END,
    now()
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_security_event_user_roles ON user_roles;
CREATE TRIGGER trigger_security_event_user_roles
  AFTER INSERT OR DELETE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION log_security_event();

-- ==============================
-- 4. Trigger لتتبع تغييرات المستفيدين
-- ==============================
CREATE OR REPLACE FUNCTION log_beneficiary_change()
RETURNS TRIGGER AS $$
DECLARE
  v_changed_fields JSONB := '[]'::JSONB;
  v_field TEXT;
  v_old_val TEXT;
  v_new_val TEXT;
BEGIN
  FOREACH v_field IN ARRAY ARRAY[
    'full_name', 'phone', 'email', 'national_id', 'iban', 
    'status', 'category', 'eligibility_status', 'bank_name'
  ] LOOP
    EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', v_field, v_field)
      INTO v_old_val, v_new_val
      USING OLD, NEW;
    
    IF v_old_val IS DISTINCT FROM v_new_val THEN
      v_changed_fields := v_changed_fields || jsonb_build_object(
        'field', v_field,
        'old', v_old_val,
        'new', v_new_val
      );
    END IF;
  END LOOP;
  
  IF jsonb_array_length(v_changed_fields) > 0 THEN
    INSERT INTO beneficiary_changes_log (
      beneficiary_id,
      change_type,
      changed_by,
      changed_by_name,
      old_value,
      new_value,
      created_at
    ) VALUES (
      NEW.id,
      'update',
      auth.uid(),
      (SELECT full_name FROM profiles WHERE user_id = auth.uid() LIMIT 1),
      v_changed_fields->0->>'old',
      v_changed_fields->0->>'new',
      now()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_beneficiary_changes ON beneficiaries;
CREATE TRIGGER trigger_beneficiary_changes
  AFTER UPDATE ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION log_beneficiary_change();

-- ==============================
-- 5. دالة لحفظ التنبيهات الذكية (مُحدّثة حسب هيكل الجدول)
-- ==============================
CREATE OR REPLACE FUNCTION save_smart_alert(
  p_alert_type TEXT,
  p_title TEXT,
  p_description TEXT,
  p_severity TEXT,
  p_entity_id UUID,
  p_entity_type TEXT,
  p_action_url TEXT
)
RETURNS UUID AS $$
DECLARE
  v_alert_id UUID;
BEGIN
  -- التحقق من عدم وجود تنبيه مشابه نشط (غير مقروء وغير مرفوض)
  SELECT id INTO v_alert_id
  FROM smart_alerts
  WHERE alert_type = p_alert_type
    AND data->>'entity_id' = p_entity_id::TEXT
    AND is_dismissed = false;
  
  IF v_alert_id IS NOT NULL THEN
    UPDATE smart_alerts
    SET 
      title = p_title,
      description = p_description,
      severity = p_severity,
      triggered_at = now()
    WHERE id = v_alert_id;
    
    RETURN v_alert_id;
  ELSE
    INSERT INTO smart_alerts (
      alert_type,
      title,
      description,
      severity,
      data,
      action_url,
      is_read,
      is_dismissed,
      triggered_at,
      created_at
    ) VALUES (
      p_alert_type,
      p_title,
      p_description,
      p_severity,
      jsonb_build_object('entity_id', p_entity_id, 'entity_type', p_entity_type),
      p_action_url,
      false,
      false,
      now(),
      now()
    )
    RETURNING id INTO v_alert_id;
    
    RETURN v_alert_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================
-- 6. تفعيل Realtime على الجداول
-- ==============================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'system_alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_alerts;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'smart_alerts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.smart_alerts;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'login_attempts_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.login_attempts_log;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'security_events_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.security_events_log;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'beneficiary_changes_log'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.beneficiary_changes_log;
  END IF;
END $$;

-- ==============================
-- 7. فهارس لتحسين الأداء
-- ==============================
CREATE INDEX IF NOT EXISTS idx_login_attempts_log_email_time 
  ON login_attempts_log(user_email, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_log_type_time 
  ON security_events_log(event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_smart_alerts_active 
  ON smart_alerts(is_dismissed, severity) WHERE is_dismissed = false;

CREATE INDEX IF NOT EXISTS idx_beneficiary_changes_beneficiary 
  ON beneficiary_changes_log(beneficiary_id, created_at DESC);