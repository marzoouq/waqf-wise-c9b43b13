-- ======================================================
-- المرحلة النهائية: Soft Delete للجداول المتبقية
-- إضافة أعمدة deleted_at للجداول الإدارية والتشغيلية
-- ======================================================

-- 1. جدول العائلات families
ALTER TABLE public.families 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 2. جدول المستأجرين tenants
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 3. جدول العقارات properties
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 4. جدول الوحدات العقارية property_units
ALTER TABLE public.property_units 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 5. جدول المستفيدين beneficiaries
ALTER TABLE public.beneficiaries 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 6. جدول طلبات المستفيدين beneficiary_requests
ALTER TABLE public.beneficiary_requests 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 7. جدول المستندات documents
ALTER TABLE public.documents 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 8. جدول أقلام الوقف waqf_units
ALTER TABLE public.waqf_units 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 9. جدول أعضاء العائلة family_members
ALTER TABLE public.family_members 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- 10. جدول المساعدات الطارئة emergency_aid
ALTER TABLE public.emergency_aid 
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz,
  ADD COLUMN IF NOT EXISTS deleted_by uuid,
  ADD COLUMN IF NOT EXISTS deletion_reason text;

-- ======================================================
-- إنشاء Triggers لمنع الحذف الفيزيائي للجداول الإدارية
-- ======================================================

-- Trigger للعائلات
DROP TRIGGER IF EXISTS prevent_delete_families ON families;
CREATE TRIGGER prevent_delete_families
BEFORE DELETE ON families
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- Trigger للمستأجرين
DROP TRIGGER IF EXISTS prevent_delete_tenants ON tenants;
CREATE TRIGGER prevent_delete_tenants
BEFORE DELETE ON tenants
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- Trigger للعقارات
DROP TRIGGER IF EXISTS prevent_delete_properties ON properties;
CREATE TRIGGER prevent_delete_properties
BEFORE DELETE ON properties
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- Trigger للوحدات العقارية
DROP TRIGGER IF EXISTS prevent_delete_property_units ON property_units;
CREATE TRIGGER prevent_delete_property_units
BEFORE DELETE ON property_units
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- Trigger للمستفيدين
DROP TRIGGER IF EXISTS prevent_delete_beneficiaries ON beneficiaries;
CREATE TRIGGER prevent_delete_beneficiaries
BEFORE DELETE ON beneficiaries
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- Trigger لطلبات المستفيدين
DROP TRIGGER IF EXISTS prevent_delete_beneficiary_requests ON beneficiary_requests;
CREATE TRIGGER prevent_delete_beneficiary_requests
BEFORE DELETE ON beneficiary_requests
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- Trigger للمستندات
DROP TRIGGER IF EXISTS prevent_delete_documents ON documents;
CREATE TRIGGER prevent_delete_documents
BEFORE DELETE ON documents
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- Trigger لأقلام الوقف
DROP TRIGGER IF EXISTS prevent_delete_waqf_units ON waqf_units;
CREATE TRIGGER prevent_delete_waqf_units
BEFORE DELETE ON waqf_units
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- Trigger لأعضاء العائلة
DROP TRIGGER IF EXISTS prevent_delete_family_members ON family_members;
CREATE TRIGGER prevent_delete_family_members
BEFORE DELETE ON family_members
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- Trigger للمساعدات الطارئة
DROP TRIGGER IF EXISTS prevent_delete_emergency_aid ON emergency_aid;
CREATE TRIGGER prevent_delete_emergency_aid
BEFORE DELETE ON emergency_aid
FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- ======================================================
-- إضافة فهارس للبحث السريع في السجلات غير المحذوفة
-- ======================================================

CREATE INDEX IF NOT EXISTS idx_families_deleted_at ON families(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_tenants_deleted_at ON tenants(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_property_units_deleted_at ON property_units(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_beneficiaries_deleted_at ON beneficiaries(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_deleted_at ON beneficiary_requests(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_deleted_at ON documents(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_waqf_units_deleted_at ON waqf_units(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_family_members_deleted_at ON family_members(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_emergency_aid_deleted_at ON emergency_aid(deleted_at) WHERE deleted_at IS NULL;

-- ======================================================
-- تطبيق Triggers حماية created_at للجداول الإدارية
-- ======================================================

DROP TRIGGER IF EXISTS protect_created_at_families ON families;
CREATE TRIGGER protect_created_at_families
BEFORE UPDATE ON families
FOR EACH ROW EXECUTE FUNCTION protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_tenants ON tenants;
CREATE TRIGGER protect_created_at_tenants
BEFORE UPDATE ON tenants
FOR EACH ROW EXECUTE FUNCTION protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_properties ON properties;
CREATE TRIGGER protect_created_at_properties
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION protect_created_at();

DROP TRIGGER IF EXISTS protect_created_at_beneficiaries ON beneficiaries;
CREATE TRIGGER protect_created_at_beneficiaries
BEFORE UPDATE ON beneficiaries
FOR EACH ROW EXECUTE FUNCTION protect_created_at();