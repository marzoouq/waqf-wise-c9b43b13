-- =====================================================
-- إصلاح المشاكل الحرجة الأربعة
-- =====================================================

-- 1. إصلاح create_system_alert_from_error - استخدام الأعمدة الصحيحة
CREATE OR REPLACE FUNCTION public.create_system_alert_from_error()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.severity = 'critical' THEN
    INSERT INTO public.system_alerts (
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
      'system',
      'active',
      jsonb_build_object(
        'error_id', NEW.id, 
        'error_type', NEW.error_type,
        'stack_trace', LEFT(NEW.error_stack, 500)
      ),
      now()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. إصلاح log_security_event - تغيير metadata إلى event_data
CREATE OR REPLACE FUNCTION public.log_security_event()
RETURNS TRIGGER AS $$
DECLARE
  v_event_type TEXT;
  v_description TEXT;
BEGIN
  IF TG_TABLE_NAME = 'user_roles' THEN
    v_event_type := CASE 
      WHEN TG_OP = 'INSERT' THEN 'role_assigned' 
      WHEN TG_OP = 'DELETE' THEN 'role_removed' 
      ELSE 'role_updated' 
    END;
    v_description := CASE 
      WHEN TG_OP = 'INSERT' THEN 'تم تعيين دور جديد' 
      WHEN TG_OP = 'DELETE' THEN 'تم إزالة دور'
      ELSE 'تم تحديث دور' 
    END;
  ELSE
    v_event_type := 'permission_changed';
    v_description := 'تم تغيير الصلاحيات';
  END IF;
  
  INSERT INTO public.security_events_log (
    event_type, 
    description, 
    user_id, 
    event_data,
    created_at
  ) VALUES (
    v_event_type, 
    v_description, 
    auth.uid(),
    CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE to_jsonb(NEW) END,
    now()
  );
  
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. إصلاح نوع ip_address في login_attempts_log
ALTER TABLE public.login_attempts_log 
ALTER COLUMN ip_address TYPE text USING ip_address::text;

ALTER TABLE public.login_attempts_log 
ALTER COLUMN ip_address DROP NOT NULL;

-- 4. إصلاح RLS على audit_logs_archive - استخدام العمود الصحيح role
DROP POLICY IF EXISTS "Admins can view archived logs" ON public.audit_logs_archive;

CREATE POLICY "Only admins can view archive" ON public.audit_logs_archive
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'nazer')
  )
);