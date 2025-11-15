-- ==============================================
-- إصلاح خطأ audit_logs record_id
-- تغيير النوع من UUID إلى TEXT للمرونة
-- ==============================================

-- 1. تغيير نوع العمود record_id إلى TEXT
ALTER TABLE public.audit_logs 
ALTER COLUMN record_id TYPE TEXT;

-- 2. إعادة إنشاء دالة log_audit_entry بدون cast
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
  v_record_id TEXT;
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
  
  -- استخراج record_id بشكل آمن
  BEGIN
    IF TG_OP = 'DELETE' THEN
      v_record_id := OLD.id::TEXT;
    ELSE
      v_record_id := NEW.id::TEXT;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    v_record_id := NULL;
  END;
  
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
    v_record_id,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    format('%s %s في جدول %s', v_action_type, 
      COALESCE(v_record_id, 'unknown'),
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

-- 3. إعادة تطبيق Trigger على الجداول الحرجة
DROP TRIGGER IF EXISTS audit_beneficiaries ON beneficiaries;
CREATE TRIGGER audit_beneficiaries
AFTER INSERT OR UPDATE OR DELETE ON beneficiaries
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_distributions ON distributions;
CREATE TRIGGER audit_distributions
AFTER INSERT OR UPDATE OR DELETE ON distributions
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_journal_entries ON journal_entries;
CREATE TRIGGER audit_journal_entries
AFTER INSERT OR UPDATE OR DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_contracts ON contracts;
CREATE TRIGGER audit_contracts
AFTER INSERT OR UPDATE OR DELETE ON contracts
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

DROP TRIGGER IF EXISTS audit_properties ON properties;
CREATE TRIGGER audit_properties
AFTER INSERT OR UPDATE OR DELETE ON properties
FOR EACH ROW EXECUTE FUNCTION log_audit_entry();

-- 4. إصلاح بيانات موجودة (إن وجدت)
-- تحويل أي UUIDs موجودة إلى TEXT
UPDATE audit_logs SET record_id = record_id WHERE record_id IS NOT NULL;