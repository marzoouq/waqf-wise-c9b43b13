
-- =====================================================
-- نظام المراقبة الشامل (Comprehensive Audit System)
-- =====================================================

-- 1) إضافة أعمدة إضافية لجدول audit_logs
ALTER TABLE public.audit_logs 
ADD COLUMN IF NOT EXISTS user_role text,
ADD COLUMN IF NOT EXISTS session_id text,
ADD COLUMN IF NOT EXISTS request_id text,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- إضافة فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);

-- 2) Function للحصول على دور المستخدم الحالي
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- 3) Function رئيسية لتسجيل العمليات تلقائياً
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _user_email text;
  _user_role text;
  _old_values jsonb;
  _new_values jsonb;
  _action_type text;
  _record_id text;
  _description text;
  _severity text;
BEGIN
  _user_id := auth.uid();
  _user_email := auth.email();
  _user_role := public.get_current_user_role();
  _action_type := TG_OP;
  
  CASE TG_OP
    WHEN 'DELETE' THEN 
      _severity := 'warning';
      _old_values := to_jsonb(OLD);
      _new_values := NULL;
      _record_id := OLD.id::text;
      _description := 'حذف سجل من ' || TG_TABLE_NAME;
    WHEN 'UPDATE' THEN 
      _severity := 'info';
      _old_values := to_jsonb(OLD);
      _new_values := to_jsonb(NEW);
      _record_id := NEW.id::text;
      _description := 'تعديل سجل في ' || TG_TABLE_NAME;
    WHEN 'INSERT' THEN 
      _severity := 'info';
      _old_values := NULL;
      _new_values := to_jsonb(NEW);
      _record_id := NEW.id::text;
      _description := 'إضافة سجل جديد إلى ' || TG_TABLE_NAME;
    ELSE
      _severity := 'info';
  END CASE;
  
  IF TG_TABLE_NAME IN ('payment_vouchers', 'journal_entries', 'distributions', 'loans', 'bank_transfers', 'bank_transfer_files') THEN
    IF TG_OP IN ('DELETE', 'UPDATE') THEN
      _severity := 'critical';
    ELSE
      _severity := 'warning';
    END IF;
  END IF;
  
  INSERT INTO public.audit_logs (
    user_id, user_email, user_role, action_type, table_name,
    record_id, old_values, new_values, description, severity, metadata
  ) VALUES (
    _user_id, _user_email, _user_role, _action_type, TG_TABLE_NAME,
    _record_id, _old_values, _new_values, _description, _severity,
    jsonb_build_object('schema', TG_TABLE_SCHEMA, 'trigger', TG_NAME, 'timestamp', now())
  );
  
  IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

-- 4) Triggers على الجداول المالية الحساسة
DROP TRIGGER IF EXISTS audit_payment_vouchers ON public.payment_vouchers;
CREATE TRIGGER audit_payment_vouchers
  AFTER INSERT OR UPDATE OR DELETE ON public.payment_vouchers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_journal_entries ON public.journal_entries;
CREATE TRIGGER audit_journal_entries
  AFTER INSERT OR UPDATE OR DELETE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_journal_entry_lines ON public.journal_entry_lines;
CREATE TRIGGER audit_journal_entry_lines
  AFTER INSERT OR UPDATE OR DELETE ON public.journal_entry_lines
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_distributions ON public.distributions;
CREATE TRIGGER audit_distributions
  AFTER INSERT OR UPDATE OR DELETE ON public.distributions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_heir_distributions ON public.heir_distributions;
CREATE TRIGGER audit_heir_distributions
  AFTER INSERT OR UPDATE OR DELETE ON public.heir_distributions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_loans ON public.loans;
CREATE TRIGGER audit_loans
  AFTER INSERT OR UPDATE OR DELETE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_loan_installments ON public.loan_installments;
CREATE TRIGGER audit_loan_installments
  AFTER INSERT OR UPDATE OR DELETE ON public.loan_installments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_bank_accounts ON public.bank_accounts;
CREATE TRIGGER audit_bank_accounts
  AFTER INSERT OR UPDATE OR DELETE ON public.bank_accounts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_bank_transfer_details ON public.bank_transfer_details;
CREATE TRIGGER audit_bank_transfer_details
  AFTER INSERT OR UPDATE OR DELETE ON public.bank_transfer_details
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_bank_transfer_files ON public.bank_transfer_files;
CREATE TRIGGER audit_bank_transfer_files
  AFTER INSERT OR UPDATE OR DELETE ON public.bank_transfer_files
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 5) Triggers على جداول المستفيدين
DROP TRIGGER IF EXISTS audit_beneficiaries ON public.beneficiaries;
CREATE TRIGGER audit_beneficiaries
  AFTER INSERT OR UPDATE OR DELETE ON public.beneficiaries
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_beneficiary_requests ON public.beneficiary_requests;
CREATE TRIGGER audit_beneficiary_requests
  AFTER INSERT OR UPDATE OR DELETE ON public.beneficiary_requests
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 6) Triggers على جداول العقارات والعقود
DROP TRIGGER IF EXISTS audit_properties ON public.properties;
CREATE TRIGGER audit_properties
  AFTER INSERT OR UPDATE OR DELETE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_property_units ON public.property_units;
CREATE TRIGGER audit_property_units
  AFTER INSERT OR UPDATE OR DELETE ON public.property_units
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_contracts ON public.contracts;
CREATE TRIGGER audit_contracts
  AFTER INSERT OR UPDATE OR DELETE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_tenants ON public.tenants;
CREATE TRIGGER audit_tenants
  AFTER INSERT OR UPDATE OR DELETE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 7) Triggers على جداول الحوكمة
DROP TRIGGER IF EXISTS audit_governance_decisions ON public.governance_decisions;
CREATE TRIGGER audit_governance_decisions
  AFTER INSERT OR UPDATE OR DELETE ON public.governance_decisions
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_governance_boards ON public.governance_boards;
CREATE TRIGGER audit_governance_boards
  AFTER INSERT OR UPDATE OR DELETE ON public.governance_boards
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 8) Triggers على جداول النظام الحساسة
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_system_settings ON public.system_settings;
CREATE TRIGGER audit_system_settings
  AFTER INSERT OR UPDATE OR DELETE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

DROP TRIGGER IF EXISTS audit_waqf_branding ON public.waqf_branding;
CREATE TRIGGER audit_waqf_branding
  AFTER INSERT OR UPDATE OR DELETE ON public.waqf_branding
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- 9) Function لتسجيل الوصول للـ Views المالية
CREATE OR REPLACE FUNCTION public.log_view_access(
  _view_name text,
  _filters jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    user_id, user_email, user_role, action_type, table_name,
    description, severity, metadata
  ) VALUES (
    auth.uid(), auth.email(), public.get_current_user_role(),
    'VIEW_ACCESS', _view_name,
    'وصول للـ View: ' || _view_name, 'info',
    jsonb_build_object('view_name', _view_name, 'filters', _filters, 'accessed_at', now())
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_view_access(text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- 10) View لعرض سجلات التدقيق
CREATE OR REPLACE VIEW public.audit_logs_summary
WITH (security_invoker = true)
AS
SELECT 
  id, user_email, user_role, action_type, table_name, record_id,
  description, severity, created_at,
  CASE action_type
    WHEN 'INSERT' THEN 'إضافة'
    WHEN 'UPDATE' THEN 'تعديل'
    WHEN 'DELETE' THEN 'حذف'
    WHEN 'VIEW_ACCESS' THEN 'عرض'
    ELSE action_type
  END as action_type_ar,
  CASE severity
    WHEN 'info' THEN 'معلومة'
    WHEN 'warning' THEN 'تحذير'
    WHEN 'error' THEN 'خطأ'
    WHEN 'critical' THEN 'حرج'
    ELSE severity
  END as severity_ar
FROM public.audit_logs
ORDER BY created_at DESC;

REVOKE ALL ON public.audit_logs_summary FROM anon;
GRANT SELECT ON public.audit_logs_summary TO authenticated;

-- 11) تحديث سياسات الإدخال
DROP POLICY IF EXISTS admin_system_insert_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS system_and_triggers_insert_audit_logs ON public.audit_logs;
DROP POLICY IF EXISTS service_role_insert_audit_logs ON public.audit_logs;

CREATE POLICY "triggers_can_insert_audit_logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);
