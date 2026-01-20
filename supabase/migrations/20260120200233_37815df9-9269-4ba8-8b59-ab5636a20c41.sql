-- إضافة أعمدة Soft Delete لجدول governance_decisions
ALTER TABLE governance_decisions 
ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS deletion_reason text;

-- إضافة triggers لمنع الحذف الفيزيائي وحماية created_at
CREATE TRIGGER prevent_delete_governance_decisions
BEFORE DELETE ON governance_decisions
FOR EACH ROW
EXECUTE FUNCTION prevent_hard_delete_financial();

CREATE TRIGGER protect_created_at_governance_decisions
BEFORE UPDATE ON governance_decisions
FOR EACH ROW
EXECUTE FUNCTION protect_created_at();