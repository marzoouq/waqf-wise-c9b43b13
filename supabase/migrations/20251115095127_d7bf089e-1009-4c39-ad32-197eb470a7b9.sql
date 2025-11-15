-- ===================================================
-- المرحلة 1: نظام Rate Limiting لحماية من Brute Force
-- ===================================================

-- جدول تسجيل محاولات تسجيل الدخول
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_time ON login_attempts(email, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_time ON login_attempts(ip_address, attempted_at DESC);

-- دالة التحقق من Rate Limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_email TEXT,
  p_ip_address TEXT,
  p_max_attempts INTEGER DEFAULT 5,
  p_time_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempts_count INTEGER;
  v_window_start TIMESTAMPTZ;
BEGIN
  v_window_start := now() - (p_time_window_minutes || ' minutes')::INTERVAL;
  
  -- حساب عدد المحاولات الفاشلة في النافذة الزمنية
  SELECT COUNT(*)
  INTO v_attempts_count
  FROM login_attempts
  WHERE (email = p_email OR ip_address = p_ip_address)
    AND success = false
    AND attempted_at >= v_window_start;
  
  -- إذا كان عدد المحاولات أقل من الحد الأقصى، السماح
  RETURN v_attempts_count < p_max_attempts;
END;
$$;

-- دالة تسجيل محاولة تسجيل الدخول
CREATE OR REPLACE FUNCTION log_login_attempt(
  p_email TEXT,
  p_ip_address TEXT,
  p_success BOOLEAN,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_attempts (email, ip_address, success, user_agent, attempted_at)
  VALUES (p_email, p_ip_address, p_success, p_user_agent, now());
  
  -- حذف السجلات القديمة (أكثر من 30 يوم)
  DELETE FROM login_attempts
  WHERE attempted_at < now() - INTERVAL '30 days';
END;
$$;

-- RLS policies لجدول login_attempts
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view login attempts"
ON login_attempts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ===================================================
-- المرحلة 2: تفعيل Audit Logging التلقائي
-- ===================================================

-- دالة عامة لتسجيل العمليات في audit_logs
CREATE OR REPLACE FUNCTION log_audit_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
  v_action_type TEXT;
  v_severity TEXT;
BEGIN
  -- الحصول على معلومات المستخدم
  v_user_id := auth.uid();
  
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;
  
  -- تحديد نوع العملية
  IF TG_OP = 'INSERT' THEN
    v_action_type := 'INSERT';
    v_severity := 'info';
  ELSIF TG_OP = 'UPDATE' THEN
    v_action_type := 'UPDATE';
    v_severity := 'info';
  ELSIF TG_OP = 'DELETE' THEN
    v_action_type := 'DELETE';
    v_severity := 'warning';
  END IF;
  
  -- تسجيل العملية في audit_logs
  INSERT INTO audit_logs (
    user_id,
    user_email,
    action_type,
    table_name,
    record_id,
    old_values,
    new_values,
    description,
    severity
  ) VALUES (
    v_user_id,
    COALESCE(v_user_email, 'system'),
    v_action_type,
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
      ELSE NEW.id::TEXT
    END,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    format('%s %s في جدول %s', v_action_type, 
      CASE 
        WHEN TG_OP = 'DELETE' THEN OLD.id::TEXT
        ELSE NEW.id::TEXT
      END,
      TG_TABLE_NAME
    ),
    v_severity
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- تطبيق Triggers على الجداول الحساسة
DROP TRIGGER IF EXISTS audit_beneficiaries_changes ON beneficiaries;
CREATE TRIGGER audit_beneficiaries_changes
AFTER INSERT OR UPDATE OR DELETE ON beneficiaries
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_families_changes ON families;
CREATE TRIGGER audit_families_changes
AFTER INSERT OR UPDATE OR DELETE ON families
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_funds_changes ON funds;
CREATE TRIGGER audit_funds_changes
AFTER INSERT OR UPDATE OR DELETE ON funds
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_journal_entries_changes ON journal_entries;
CREATE TRIGGER audit_journal_entries_changes
AFTER INSERT OR UPDATE OR DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_bank_accounts_changes ON bank_accounts;
CREATE TRIGGER audit_bank_accounts_changes
AFTER INSERT OR UPDATE OR DELETE ON bank_accounts
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_contracts_changes ON contracts;
CREATE TRIGGER audit_contracts_changes
AFTER INSERT OR UPDATE OR DELETE ON contracts
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_loans_changes ON loans;
CREATE TRIGGER audit_loans_changes
AFTER INSERT OR UPDATE OR DELETE ON loans
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_properties_changes ON properties;
CREATE TRIGGER audit_properties_changes
AFTER INSERT OR UPDATE OR DELETE ON properties
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_distributions_changes ON distributions;
CREATE TRIGGER audit_distributions_changes
AFTER INSERT OR UPDATE OR DELETE ON distributions
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_user_roles_changes ON user_roles;
CREATE TRIGGER audit_user_roles_changes
AFTER INSERT OR UPDATE OR DELETE ON user_roles
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- RLS policies لجدول audit_logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
CREATE POLICY "Only admins can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  )
);

-- ===================================================
-- المرحلة 3: دمج Activities مع Audit Logs
-- ===================================================

-- إنشاء View لعرض الأنشطة الأخيرة من audit_logs
CREATE OR REPLACE VIEW recent_activities AS
SELECT 
  al.id,
  CASE 
    WHEN al.action_type = 'INSERT' THEN 'تمت إضافة سجل في ' || 
      CASE al.table_name
        WHEN 'beneficiaries' THEN 'المستفيدين'
        WHEN 'families' THEN 'العائلات'
        WHEN 'funds' THEN 'الصناديق'
        WHEN 'journal_entries' THEN 'القيود المحاسبية'
        WHEN 'contracts' THEN 'العقود'
        WHEN 'loans' THEN 'القروض'
        WHEN 'properties' THEN 'العقارات'
        WHEN 'distributions' THEN 'التوزيعات'
        ELSE al.table_name
      END
    WHEN al.action_type = 'UPDATE' THEN 'تم تحديث سجل في ' || 
      CASE al.table_name
        WHEN 'beneficiaries' THEN 'المستفيدين'
        WHEN 'families' THEN 'العائلات'
        WHEN 'funds' THEN 'الصناديق'
        WHEN 'journal_entries' THEN 'القيود المحاسبية'
        WHEN 'contracts' THEN 'العقود'
        WHEN 'loans' THEN 'القروض'
        WHEN 'properties' THEN 'العقارات'
        WHEN 'distributions' THEN 'التوزيعات'
        ELSE al.table_name
      END
    WHEN al.action_type = 'DELETE' THEN 'تم حذف سجل من ' || 
      CASE al.table_name
        WHEN 'beneficiaries' THEN 'المستفيدين'
        WHEN 'families' THEN 'العائلات'
        WHEN 'funds' THEN 'الصناديق'
        WHEN 'journal_entries' THEN 'القيود المحاسبية'
        WHEN 'contracts' THEN 'العقود'
        WHEN 'loans' THEN 'القروض'
        WHEN 'properties' THEN 'العقارات'
        WHEN 'distributions' THEN 'التوزيعات'
        ELSE al.table_name
      END
    ELSE al.description
  END as action,
  COALESCE(al.user_email, 'النظام') as user_name,
  al.created_at as timestamp,
  al.created_at
FROM audit_logs al
WHERE al.created_at IS NOT NULL
ORDER BY al.created_at DESC
LIMIT 100;

-- منح الصلاحيات على الـ View
GRANT SELECT ON recent_activities TO authenticated;