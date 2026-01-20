-- ═══════════════════════════════════════════════════════════════════════════
-- 🕋 WAQF FINANCIAL GOVERNANCE - SHARIA COMPLIANCE MIGRATION (Final)
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 1: SOFT DELETE - منع الحذف الفيزيائي
-- ═══════════════════════════════════════════════════════════════════════════

-- 1.1 Add deleted_at and deleted_by columns to financial tables
ALTER TABLE payment_vouchers ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE payment_vouchers ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
ALTER TABLE payment_vouchers ADD COLUMN IF NOT EXISTS deletion_reason text;

ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS deletion_reason text;

ALTER TABLE distributions ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE distributions ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
ALTER TABLE distributions ADD COLUMN IF NOT EXISTS deletion_reason text;

ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS deletion_reason text;

ALTER TABLE loans ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
ALTER TABLE loans ADD COLUMN IF NOT EXISTS deletion_reason text;

ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
ALTER TABLE rental_payments ADD COLUMN IF NOT EXISTS deletion_reason text;

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 1.2 Create prevent hard delete function
CREATE OR REPLACE FUNCTION prevent_hard_delete_financial()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'الحذف الفيزيائي ممنوع في نظام الوقف المالي. استخدم soft delete بتحديث deleted_at بدلاً من ذلك. Hard delete is forbidden in Waqf financial system.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 1.3 Apply triggers to prevent hard delete on all financial tables
DROP TRIGGER IF EXISTS prevent_delete_payment_vouchers ON payment_vouchers;
CREATE TRIGGER prevent_delete_payment_vouchers
BEFORE DELETE ON payment_vouchers
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

DROP TRIGGER IF EXISTS prevent_delete_journal_entries ON journal_entries;
CREATE TRIGGER prevent_delete_journal_entries
BEFORE DELETE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

DROP TRIGGER IF EXISTS prevent_delete_distributions ON distributions;
CREATE TRIGGER prevent_delete_distributions
BEFORE DELETE ON distributions
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

DROP TRIGGER IF EXISTS prevent_delete_contracts ON contracts;
CREATE TRIGGER prevent_delete_contracts
BEFORE DELETE ON contracts
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

DROP TRIGGER IF EXISTS prevent_delete_loans ON loans;
CREATE TRIGGER prevent_delete_loans
BEFORE DELETE ON loans
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

DROP TRIGGER IF EXISTS prevent_delete_rental_payments ON rental_payments;
CREATE TRIGGER prevent_delete_rental_payments
BEFORE DELETE ON rental_payments
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

DROP TRIGGER IF EXISTS prevent_delete_invoices ON invoices;
CREATE TRIGGER prevent_delete_invoices
BEFORE DELETE ON invoices
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 2: IMMUTABLE TIMESTAMPS - حماية الختم الزمني
-- ═══════════════════════════════════════════════════════════════════════════

-- 2.1 Create function to protect created_at
CREATE OR REPLACE FUNCTION protect_created_at()
RETURNS trigger AS $$
BEGIN
  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'تعديل created_at ممنوع - الختم الزمني غير قابل للتغيير. Modifying created_at is forbidden - timestamp is immutable.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2.2 Apply to financial tables
DROP TRIGGER IF EXISTS protect_created_at_payment_vouchers ON payment_vouchers;
CREATE TRIGGER protect_created_at_payment_vouchers
BEFORE UPDATE ON payment_vouchers
FOR EACH ROW EXECUTE FUNCTION protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_journal_entries ON journal_entries;
CREATE TRIGGER protect_created_at_journal_entries
BEFORE UPDATE ON journal_entries
FOR EACH ROW EXECUTE FUNCTION protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_distributions ON distributions;
CREATE TRIGGER protect_created_at_distributions
BEFORE UPDATE ON distributions
FOR EACH ROW EXECUTE FUNCTION protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_contracts ON contracts;
CREATE TRIGGER protect_created_at_contracts
BEFORE UPDATE ON contracts
FOR EACH ROW EXECUTE FUNCTION protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_loans ON loans;
CREATE TRIGGER protect_created_at_loans
BEFORE UPDATE ON loans
FOR EACH ROW EXECUTE FUNCTION protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_rental_payments ON rental_payments;
CREATE TRIGGER protect_created_at_rental_payments
BEFORE UPDATE ON rental_payments
FOR EACH ROW EXECUTE FUNCTION protect_created_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 3: DUAL CONTROL - فصل الولاية
-- ═══════════════════════════════════════════════════════════════════════════

-- 3.1 Create dual control enforcement function
CREATE OR REPLACE FUNCTION enforce_dual_control()
RETURNS trigger AS $$
DECLARE
  threshold_amount numeric;
  check_amount numeric;
BEGIN
  -- Set threshold based on table
  IF TG_TABLE_NAME = 'payment_vouchers' THEN
    threshold_amount := 10000;
    check_amount := COALESCE(NEW.amount, 0);
  ELSIF TG_TABLE_NAME = 'distributions' THEN
    threshold_amount := 50000;
    check_amount := COALESCE(NEW.total_amount, 0);
  ELSE
    threshold_amount := 10000;
    check_amount := COALESCE(NEW.amount, 0);
  END IF;
  
  -- Check if amount exceeds threshold and approval is from different person
  IF NEW.status IN ('approved', 'posted', 'paid', 'completed') THEN
    IF check_amount > threshold_amount THEN
      IF NEW.approved_by IS NULL THEN
        RAISE EXCEPTION 'المبالغ التي تتجاوز % تتطلب موافقة. Amounts exceeding % require approval.', threshold_amount, threshold_amount;
      END IF;
      IF NEW.approved_by = NEW.created_by THEN
        RAISE EXCEPTION 'المبالغ التي تتجاوز % تتطلب موافقة من شخص مختلف عن المنشئ. Amounts exceeding % require approval from a different person than the creator.', threshold_amount, threshold_amount;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3.2 Apply dual control triggers
DROP TRIGGER IF EXISTS enforce_dual_control_payment_vouchers ON payment_vouchers;
CREATE TRIGGER enforce_dual_control_payment_vouchers
BEFORE INSERT OR UPDATE ON payment_vouchers
FOR EACH ROW EXECUTE FUNCTION enforce_dual_control();

DROP TRIGGER IF EXISTS enforce_dual_control_distributions ON distributions;
CREATE TRIGGER enforce_dual_control_distributions
BEFORE INSERT OR UPDATE ON distributions
FOR EACH ROW EXECUTE FUNCTION enforce_dual_control();

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 4: IMMUTABLE AUDIT LOGS - سجل تدقيق غير قابل للتعديل
-- ═══════════════════════════════════════════════════════════════════════════

-- 4.1 Create immutable audit logs function
CREATE OR REPLACE FUNCTION immutable_audit_logs()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'سجلات التدقيق غير قابلة للتعديل أو الحذف. Audit logs are immutable and cannot be modified or deleted.';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4.2 Apply immutability trigger to audit_logs
DROP TRIGGER IF EXISTS protect_audit_logs_immutable ON audit_logs;
CREATE TRIGGER protect_audit_logs_immutable
BEFORE UPDATE OR DELETE ON audit_logs
FOR EACH ROW EXECUTE FUNCTION immutable_audit_logs();

-- 4.3 Revoke dangerous permissions on audit_logs
REVOKE UPDATE, DELETE ON audit_logs FROM authenticated;
REVOKE UPDATE, DELETE ON audit_logs FROM anon;

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 5: INDEXES FOR SOFT DELETE QUERIES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_payment_vouchers_deleted_at ON payment_vouchers(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_journal_entries_deleted_at ON journal_entries(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_distributions_deleted_at ON distributions(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_contracts_deleted_at ON contracts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_loans_deleted_at ON loans(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_rental_payments_deleted_at ON rental_payments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_invoices_deleted_at ON invoices(deleted_at) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 6: GOVERNANCE METADATA TABLE
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS waqf_governance_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  description_ar text,
  description_en text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  updated_by uuid REFERENCES auth.users(id)
);

-- Insert governance thresholds
INSERT INTO waqf_governance_config (config_key, config_value, description_ar, description_en)
VALUES 
  ('dual_control_threshold_voucher', '{"amount": 10000, "currency": "SAR"}', 'حد فصل الولاية لسندات الصرف', 'Dual control threshold for payment vouchers'),
  ('dual_control_threshold_distribution', '{"amount": 50000, "currency": "SAR"}', 'حد فصل الولاية للتوزيعات', 'Dual control threshold for distributions'),
  ('audit_retention_years', '{"years": 99}', 'سنوات الاحتفاظ بسجلات التدقيق', 'Audit log retention years'),
  ('soft_delete_enabled', '{"enabled": true}', 'تفعيل الحذف اللين', 'Soft delete enabled')
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();

-- Enable RLS on governance config
ALTER TABLE waqf_governance_config ENABLE ROW LEVEL SECURITY;

-- Create helper function for checking nazer/admin role
CREATE OR REPLACE FUNCTION is_nazer_or_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = is_nazer_or_admin.user_id
    AND role IN ('nazer', 'admin')
  )
$$;

-- Only nazer and admin can view/modify governance config
CREATE POLICY "Admin and nazer can manage governance config"
ON waqf_governance_config
FOR ALL
USING (is_nazer_or_admin(auth.uid()))
WITH CHECK (is_nazer_or_admin(auth.uid()));

-- Add comments for documentation
COMMENT ON TABLE waqf_governance_config IS 'إعدادات حوكمة الوقف المالي - Waqf Financial Governance Configuration';
COMMENT ON FUNCTION prevent_hard_delete_financial() IS 'منع الحذف الفيزيائي للسجلات المالية - شرط شرعي وتدقيقي';
COMMENT ON FUNCTION protect_created_at() IS 'حماية الختم الزمني من التعديل - ضمان النزاهة الزمنية';
COMMENT ON FUNCTION enforce_dual_control() IS 'فصل الولاية - المنشئ ≠ المعتمد للمبالغ الكبيرة';
COMMENT ON FUNCTION immutable_audit_logs() IS 'منع تعديل أو حذف سجلات التدقيق';
COMMENT ON FUNCTION is_nazer_or_admin(uuid) IS 'فحص صلاحية الناظر أو المدير';