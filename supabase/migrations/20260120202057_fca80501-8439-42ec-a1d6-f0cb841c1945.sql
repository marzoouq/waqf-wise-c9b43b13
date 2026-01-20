
-- ══════════════════════════════════════════════════════════════════
-- Migration: إضافة Soft Delete للجداول المتبقية وتطبيق الحماية الكاملة
-- الهدف: تغطية 100% من الجداول الحساسة بآلية منع الحذف الفيزيائي
-- ══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- 1. إضافة أعمدة Soft Delete للجداول الجديدة
-- ═══════════════════════════════════════════════════════════════════

-- جدول scheduled_report_jobs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scheduled_report_jobs' AND column_name = 'deleted_at') THEN
    ALTER TABLE scheduled_report_jobs ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scheduled_report_jobs' AND column_name = 'deleted_by') THEN
    ALTER TABLE scheduled_report_jobs ADD COLUMN deleted_by UUID DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'scheduled_report_jobs' AND column_name = 'deletion_reason') THEN
    ALTER TABLE scheduled_report_jobs ADD COLUMN deletion_reason TEXT DEFAULT NULL;
  END IF;
END $$;

-- جدول beneficiary_attachments
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beneficiary_attachments' AND column_name = 'deleted_at') THEN
    ALTER TABLE beneficiary_attachments ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beneficiary_attachments' AND column_name = 'deleted_by') THEN
    ALTER TABLE beneficiary_attachments ADD COLUMN deleted_by UUID DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'beneficiary_attachments' AND column_name = 'deletion_reason') THEN
    ALTER TABLE beneficiary_attachments ADD COLUMN deletion_reason TEXT DEFAULT NULL;
  END IF;
END $$;

-- جدول ai_system_audits
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_system_audits' AND column_name = 'deleted_at') THEN
    ALTER TABLE ai_system_audits ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_system_audits' AND column_name = 'deleted_by') THEN
    ALTER TABLE ai_system_audits ADD COLUMN deleted_by UUID DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_system_audits' AND column_name = 'deletion_reason') THEN
    ALTER TABLE ai_system_audits ADD COLUMN deletion_reason TEXT DEFAULT NULL;
  END IF;
END $$;

-- جدول document_tags
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_tags' AND column_name = 'deleted_at') THEN
    ALTER TABLE document_tags ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_tags' AND column_name = 'deleted_by') THEN
    ALTER TABLE document_tags ADD COLUMN deleted_by UUID DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'document_tags' AND column_name = 'deletion_reason') THEN
    ALTER TABLE document_tags ADD COLUMN deletion_reason TEXT DEFAULT NULL;
  END IF;
END $$;

-- جدول dashboard_configurations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_configurations' AND column_name = 'deleted_at') THEN
    ALTER TABLE dashboard_configurations ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_configurations' AND column_name = 'deleted_by') THEN
    ALTER TABLE dashboard_configurations ADD COLUMN deleted_by UUID DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'dashboard_configurations' AND column_name = 'deletion_reason') THEN
    ALTER TABLE dashboard_configurations ADD COLUMN deletion_reason TEXT DEFAULT NULL;
  END IF;
END $$;

-- جدول webauthn_credentials
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webauthn_credentials' AND column_name = 'deleted_at') THEN
    ALTER TABLE webauthn_credentials ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webauthn_credentials' AND column_name = 'deleted_by') THEN
    ALTER TABLE webauthn_credentials ADD COLUMN deleted_by UUID DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'webauthn_credentials' AND column_name = 'deletion_reason') THEN
    ALTER TABLE webauthn_credentials ADD COLUMN deletion_reason TEXT DEFAULT NULL;
  END IF;
END $$;

-- جدول profiles 
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'deleted_at') THEN
    ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'deleted_by') THEN
    ALTER TABLE profiles ADD COLUMN deleted_by UUID DEFAULT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'deletion_reason') THEN
    ALTER TABLE profiles ADD COLUMN deletion_reason TEXT DEFAULT NULL;
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════════
-- 2. تطبيق Triggers لمنع الحذف الفيزيائي
-- ═══════════════════════════════════════════════════════════════════

-- scheduled_report_jobs
DROP TRIGGER IF EXISTS prevent_delete_scheduled_report_jobs ON scheduled_report_jobs;
CREATE TRIGGER prevent_delete_scheduled_report_jobs
  BEFORE DELETE ON scheduled_report_jobs
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- beneficiary_attachments
DROP TRIGGER IF EXISTS prevent_delete_beneficiary_attachments ON beneficiary_attachments;
CREATE TRIGGER prevent_delete_beneficiary_attachments
  BEFORE DELETE ON beneficiary_attachments
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- ai_system_audits (تقارير الفحص - حماية للمراجعة)
DROP TRIGGER IF EXISTS prevent_delete_ai_system_audits ON ai_system_audits;
CREATE TRIGGER prevent_delete_ai_system_audits
  BEFORE DELETE ON ai_system_audits
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- document_tags
DROP TRIGGER IF EXISTS prevent_delete_document_tags ON document_tags;
CREATE TRIGGER prevent_delete_document_tags
  BEFORE DELETE ON document_tags
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- dashboard_configurations
DROP TRIGGER IF EXISTS prevent_delete_dashboard_configurations ON dashboard_configurations;
CREATE TRIGGER prevent_delete_dashboard_configurations
  BEFORE DELETE ON dashboard_configurations
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- webauthn_credentials
DROP TRIGGER IF EXISTS prevent_delete_webauthn_credentials ON webauthn_credentials;
CREATE TRIGGER prevent_delete_webauthn_credentials
  BEFORE DELETE ON webauthn_credentials
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- profiles
DROP TRIGGER IF EXISTS prevent_delete_profiles ON profiles;
CREATE TRIGGER prevent_delete_profiles
  BEFORE DELETE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_hard_delete_financial();

-- ═══════════════════════════════════════════════════════════════════
-- 3. تطبيق Triggers لحماية created_at
-- ═══════════════════════════════════════════════════════════════════

-- scheduled_report_jobs
DROP TRIGGER IF EXISTS protect_created_at_scheduled_report_jobs ON scheduled_report_jobs;
CREATE TRIGGER protect_created_at_scheduled_report_jobs
  BEFORE UPDATE ON scheduled_report_jobs
  FOR EACH ROW EXECUTE FUNCTION protect_created_at();

-- beneficiary_attachments
DROP TRIGGER IF EXISTS protect_created_at_beneficiary_attachments ON beneficiary_attachments;
CREATE TRIGGER protect_created_at_beneficiary_attachments
  BEFORE UPDATE ON beneficiary_attachments
  FOR EACH ROW EXECUTE FUNCTION protect_created_at();

-- ai_system_audits
DROP TRIGGER IF EXISTS protect_created_at_ai_system_audits ON ai_system_audits;
CREATE TRIGGER protect_created_at_ai_system_audits
  BEFORE UPDATE ON ai_system_audits
  FOR EACH ROW EXECUTE FUNCTION protect_created_at();

-- document_tags
DROP TRIGGER IF EXISTS protect_created_at_document_tags ON document_tags;
CREATE TRIGGER protect_created_at_document_tags
  BEFORE UPDATE ON document_tags
  FOR EACH ROW EXECUTE FUNCTION protect_created_at();

-- dashboard_configurations
DROP TRIGGER IF EXISTS protect_created_at_dashboard_configurations ON dashboard_configurations;
CREATE TRIGGER protect_created_at_dashboard_configurations
  BEFORE UPDATE ON dashboard_configurations
  FOR EACH ROW EXECUTE FUNCTION protect_created_at();

-- webauthn_credentials
DROP TRIGGER IF EXISTS protect_created_at_webauthn_credentials ON webauthn_credentials;
CREATE TRIGGER protect_created_at_webauthn_credentials
  BEFORE UPDATE ON webauthn_credentials
  FOR EACH ROW EXECUTE FUNCTION protect_created_at();

-- profiles
DROP TRIGGER IF EXISTS protect_created_at_profiles ON profiles;
CREATE TRIGGER protect_created_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION protect_created_at();

-- ═══════════════════════════════════════════════════════════════════
-- 4. إنشاء فهارس لتحسين الأداء على أعمدة deleted_at
-- ═══════════════════════════════════════════════════════════════════

CREATE INDEX IF NOT EXISTS idx_scheduled_report_jobs_not_deleted ON scheduled_report_jobs(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_beneficiary_attachments_not_deleted ON beneficiary_attachments(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ai_system_audits_not_deleted ON ai_system_audits(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_document_tags_not_deleted ON document_tags(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dashboard_configurations_not_deleted ON dashboard_configurations(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_not_deleted ON webauthn_credentials(id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_not_deleted ON profiles(user_id) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 5. ملخص: الجداول المحمية بالكامل الآن
-- ═══════════════════════════════════════════════════════════════════
-- 
-- الجداول الجديدة المحمية في هذا الـ Migration:
-- 1. scheduled_report_jobs
-- 2. beneficiary_attachments  
-- 3. ai_system_audits
-- 4. document_tags
-- 5. dashboard_configurations
-- 6. webauthn_credentials
-- 7. profiles
--
-- إجمالي الجداول المحمية الآن: 45+ جدول
-- ═══════════════════════════════════════════════════════════════════
