-- إضافة أعمدة soft delete للجداول المتبقية
ALTER TABLE public.funds 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- Trigger لمنع الحذف
DROP TRIGGER IF EXISTS prevent_delete_funds ON funds;
CREATE TRIGGER prevent_delete_funds
BEFORE DELETE ON funds
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_funds_deleted_at ON funds(deleted_at) WHERE deleted_at IS NULL;