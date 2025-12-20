-- ═══════════════════════════════════════════════════════════════════════════
-- الخطوة 1: إصلاح تعارضات user_roles (7 → 2 سياسات)
-- ═══════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "admins_delete_roles" ON user_roles;
DROP POLICY IF EXISTS "admins_insert_roles" ON user_roles;
DROP POLICY IF EXISTS "admins_update_roles" ON user_roles;
DROP POLICY IF EXISTS "admins_view_all_roles" ON user_roles;
DROP POLICY IF EXISTS "users_view_own_roles" ON user_roles;

-- ═══════════════════════════════════════════════════════════════════════════
-- الخطوة 2: إصلاح تداخل beneficiaries (2 → 1 سياسة SELECT)
-- ═══════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "beneficiaries_self_access" ON beneficiaries;

-- ═══════════════════════════════════════════════════════════════════════════
-- الخطوة 3: إصلاح tenants ومنع archivist (6 → 3 سياسات)
-- ═══════════════════════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "staff_tenants" ON tenants;
DROP POLICY IF EXISTS "tenants_staff_manage" ON tenants;
DROP POLICY IF EXISTS "financial_staff_view_tenants" ON tenants;
DROP POLICY IF EXISTS "tenants_view" ON tenants;

-- إضافة سياسة SELECT للورثة
CREATE POLICY "tenants_waqf_heir_view" ON tenants
FOR SELECT USING (has_role(auth.uid(), 'waqf_heir'));

-- ═══════════════════════════════════════════════════════════════════════════
-- الخطوة 4: تفعيل Audit Logging بإضافة Triggers
-- ═══════════════════════════════════════════════════════════════════════════

-- إنشاء دالة Trigger موحدة لتسجيل التغييرات
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
BEGIN
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
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id)::text,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    'Automated audit: ' || TG_OP || ' on ' || TG_TABLE_NAME,
    CASE 
      WHEN TG_TABLE_NAME = 'bank_accounts' THEN 'warning'
      WHEN TG_OP = 'DELETE' THEN 'warning'
      ELSE 'info'
    END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إضافة Triggers على الجداول الحساسة
DROP TRIGGER IF EXISTS audit_beneficiaries_changes ON beneficiaries;
CREATE TRIGGER audit_beneficiaries_changes
AFTER INSERT OR UPDATE OR DELETE ON beneficiaries
FOR EACH ROW EXECUTE FUNCTION log_table_changes();

DROP TRIGGER IF EXISTS audit_bank_accounts_changes ON bank_accounts;
CREATE TRIGGER audit_bank_accounts_changes
AFTER INSERT OR UPDATE OR DELETE ON bank_accounts
FOR EACH ROW EXECUTE FUNCTION log_table_changes();

DROP TRIGGER IF EXISTS audit_tenants_changes ON tenants;
CREATE TRIGGER audit_tenants_changes
AFTER INSERT OR UPDATE OR DELETE ON tenants
FOR EACH ROW EXECUTE FUNCTION log_table_changes();