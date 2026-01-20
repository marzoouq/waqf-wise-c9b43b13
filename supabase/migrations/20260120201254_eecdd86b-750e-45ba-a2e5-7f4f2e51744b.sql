
-- =====================================================
-- المرحلة النهائية: تكملة الامتثال الوقفي الشامل
-- إضافة Soft Delete للجداول المتبقية + triggers الحماية
-- =====================================================

-- 1. إضافة أعمدة Soft Delete لجدول invoice_lines
ALTER TABLE invoice_lines 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 2. إضافة أعمدة Soft Delete لجدول accounts (الحسابات)
ALTER TABLE accounts 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 3. إضافة أعمدة Soft Delete لجدول maintenance_requests
ALTER TABLE maintenance_requests 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 4. إضافة أعمدة Soft Delete لجدول maintenance_providers
ALTER TABLE maintenance_providers 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 5. إضافة أعمدة Soft Delete لجدول budgets
ALTER TABLE budgets 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 6. إضافة عمود archived_at لجدول audit_logs (للأرشفة بدون حذف)
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS archived_at timestamptz;

-- =====================================================
-- إنشاء Triggers لمنع الحذف الفيزيائي (باستخدام DO block)
-- =====================================================

DO $$
BEGIN
  -- Trigger لجدول invoice_lines
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_delete_invoice_lines') THEN
    CREATE TRIGGER prevent_delete_invoice_lines
    BEFORE DELETE ON invoice_lines
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();
  END IF;

  -- Trigger لجدول accounts
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_delete_accounts') THEN
    CREATE TRIGGER prevent_delete_accounts
    BEFORE DELETE ON accounts
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();
  END IF;

  -- Trigger لجدول maintenance_requests
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_delete_maintenance_requests') THEN
    CREATE TRIGGER prevent_delete_maintenance_requests
    BEFORE DELETE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();
  END IF;

  -- Trigger لجدول maintenance_providers
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_delete_maintenance_providers') THEN
    CREATE TRIGGER prevent_delete_maintenance_providers
    BEFORE DELETE ON maintenance_providers
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();
  END IF;

  -- Trigger لجدول budgets
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_delete_budgets') THEN
    CREATE TRIGGER prevent_delete_budgets
    BEFORE DELETE ON budgets
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();
  END IF;

  -- Trigger لمنع الحذف من audit_logs
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'prevent_delete_audit_logs') THEN
    CREATE TRIGGER prevent_delete_audit_logs
    BEFORE DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();
  END IF;

  -- Triggers لحماية created_at
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'protect_created_at_invoice_lines') THEN
    CREATE TRIGGER protect_created_at_invoice_lines
    BEFORE UPDATE ON invoice_lines
    FOR EACH ROW EXECUTE FUNCTION protect_created_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'protect_created_at_accounts') THEN
    CREATE TRIGGER protect_created_at_accounts
    BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION protect_created_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'protect_created_at_budgets') THEN
    CREATE TRIGGER protect_created_at_budgets
    BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION protect_created_at();
  END IF;
END $$;

-- =====================================================
-- فهارس للأداء على الأعمدة الجديدة
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_invoice_lines_deleted_at ON invoice_lines(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_accounts_deleted_at ON accounts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_deleted_at ON maintenance_requests(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_budgets_deleted_at ON budgets(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_audit_logs_archived_at ON audit_logs(archived_at) WHERE archived_at IS NULL;
