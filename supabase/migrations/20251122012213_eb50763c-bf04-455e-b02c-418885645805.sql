-- ============================================
-- المرحلة 1: إنشاء جداول إدارة التشفير والأمان
-- ============================================

-- جدول مفاتيح التشفير (Encryption Keys Management)
CREATE TABLE IF NOT EXISTS encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE,
  key_type TEXT NOT NULL CHECK (key_type IN ('aes-256', 'rsa-2048', 'master')),
  key_purpose TEXT NOT NULL, -- 'file_encryption', 'data_encryption', 'backup'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  rotated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- جدول البيانات المشفرة (Encrypted Data Registry)
CREATE TABLE IF NOT EXISTS encrypted_data_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  column_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  encryption_key_id UUID REFERENCES encryption_keys(id),
  encryption_algorithm TEXT NOT NULL DEFAULT 'AES-256-GCM',
  encrypted_at TIMESTAMPTZ DEFAULT now(),
  last_accessed_at TIMESTAMPTZ,
  access_count INTEGER DEFAULT 0,
  is_decrypted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- جدول الملفات المشفرة (Encrypted Files)
CREATE TABLE IF NOT EXISTS encrypted_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_file_name TEXT NOT NULL,
  encrypted_file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  encryption_key_id UUID REFERENCES encryption_keys(id),
  encryption_iv TEXT NOT NULL, -- Initialization Vector
  encryption_tag TEXT, -- Authentication Tag for GCM
  checksum TEXT NOT NULL, -- SHA-256 checksum
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_deleted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- جدول سياسات الحذف (Deletion Policies)
CREATE TABLE IF NOT EXISTS file_retention_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_name TEXT NOT NULL UNIQUE,
  file_category TEXT NOT NULL, -- 'contracts', 'beneficiary_documents', 'financial', etc.
  retention_days INTEGER NOT NULL CHECK (retention_days > 0),
  auto_delete BOOLEAN DEFAULT false,
  requires_approval BOOLEAN DEFAULT true,
  approval_role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- جدول الملفات المحذوفة (Deleted Files Audit)
CREATE TABLE IF NOT EXISTS deleted_files_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_file_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_category TEXT,
  deleted_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ DEFAULT now(),
  deletion_reason TEXT,
  retention_policy_id UUID REFERENCES file_retention_policies(id),
  can_restore BOOLEAN DEFAULT false,
  restore_until TIMESTAMPTZ,
  permanent_deletion_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  backup_location TEXT -- for disaster recovery
);

-- جدول تسجيل الوصول للبيانات الحساسة (Sensitive Data Access Log)
CREATE TABLE IF NOT EXISTS sensitive_data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  user_email TEXT,
  table_name TEXT NOT NULL,
  record_id UUID,
  column_name TEXT,
  access_type TEXT NOT NULL CHECK (access_type IN ('read', 'decrypt', 'download', 'export')),
  ip_address TEXT,
  user_agent TEXT,
  access_reason TEXT,
  was_granted BOOLEAN DEFAULT true,
  denial_reason TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now(),
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- جدول طلبات الحذف (Deletion Requests)
CREATE TABLE IF NOT EXISTS file_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL,
  file_category TEXT NOT NULL,
  requested_by UUID REFERENCES auth.users(id),
  requested_at TIMESTAMPTZ DEFAULT now(),
  reason TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- جدول عمليات تدوير المفاتيح (Key Rotation History)
CREATE TABLE IF NOT EXISTS encryption_key_rotation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_key_id UUID REFERENCES encryption_keys(id),
  new_key_id UUID REFERENCES encryption_keys(id),
  rotation_reason TEXT NOT NULL,
  rotated_by UUID REFERENCES auth.users(id),
  rotated_at TIMESTAMPTZ DEFAULT now(),
  affected_records_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
  error_message TEXT,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- الفهارس لتحسين الأداء
-- ============================================

CREATE INDEX idx_encrypted_files_uploaded_by ON encrypted_files(uploaded_by);
CREATE INDEX idx_encrypted_files_expires_at ON encrypted_files(expires_at) WHERE is_deleted = false;
CREATE INDEX idx_deleted_files_audit_deleted_at ON deleted_files_audit(deleted_at);
CREATE INDEX idx_deleted_files_audit_can_restore ON deleted_files_audit(can_restore) WHERE can_restore = true;
CREATE INDEX idx_sensitive_data_access_log_user_id ON sensitive_data_access_log(user_id);
CREATE INDEX idx_sensitive_data_access_log_accessed_at ON sensitive_data_access_log(accessed_at);
CREATE INDEX idx_file_deletion_requests_status ON file_deletion_requests(status) WHERE status = 'pending';
CREATE INDEX idx_encryption_keys_is_active ON encryption_keys(is_active) WHERE is_active = true;

-- ============================================
-- Enable RLS على جميع الجداول
-- ============================================

ALTER TABLE encryption_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_data_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_retention_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_files_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensitive_data_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE encryption_key_rotation_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies - Admin & Nazer Only Access
-- ============================================

-- encryption_keys
CREATE POLICY "admin_nazer_full_access_encryption_keys"
ON encryption_keys FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer')
);

-- encrypted_data_registry
CREATE POLICY "admin_nazer_view_encrypted_registry"
ON encrypted_data_registry FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer')
);

-- encrypted_files
CREATE POLICY "admin_nazer_accountant_view_encrypted_files"
ON encrypted_files FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer') OR
  has_role(auth.uid(), 'accountant')
);

CREATE POLICY "admin_nazer_manage_encrypted_files"
ON encrypted_files FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer')
);

-- file_retention_policies
CREATE POLICY "admin_nazer_manage_retention_policies"
ON file_retention_policies FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer')
);

-- deleted_files_audit
CREATE POLICY "admin_nazer_view_deleted_audit"
ON deleted_files_audit FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer')
);

-- sensitive_data_access_log
CREATE POLICY "admin_nazer_view_access_logs"
ON sensitive_data_access_log FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer')
);

CREATE POLICY "system_insert_access_logs"
ON sensitive_data_access_log FOR INSERT
TO authenticated
WITH CHECK (true);

-- file_deletion_requests
CREATE POLICY "users_view_own_deletion_requests"
ON file_deletion_requests FOR SELECT
TO authenticated
USING (
  requested_by = auth.uid() OR
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer')
);

CREATE POLICY "users_create_deletion_requests"
ON file_deletion_requests FOR INSERT
TO authenticated
WITH CHECK (requested_by = auth.uid());

CREATE POLICY "admin_nazer_manage_deletion_requests"
ON file_deletion_requests FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer')
);

-- encryption_key_rotation_history
CREATE POLICY "admin_nazer_view_key_rotation"
ON encryption_key_rotation_history FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'nazer')
);

-- ============================================
-- Triggers لإدارة التواريخ
-- ============================================

CREATE TRIGGER update_file_retention_policies_updated_at
BEFORE UPDATE ON file_retention_policies
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================
-- وظائف مساعدة للتشفير والحذف
-- ============================================

-- وظيفة لتسجيل الوصول للبيانات الحساسة
CREATE OR REPLACE FUNCTION log_sensitive_data_access(
  p_table_name TEXT,
  p_record_id UUID,
  p_column_name TEXT,
  p_access_type TEXT,
  p_access_reason TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_user_email TEXT;
BEGIN
  v_user_id := auth.uid();
  
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = v_user_id;
  
  INSERT INTO sensitive_data_access_log (
    user_id,
    user_email,
    table_name,
    record_id,
    column_name,
    access_type,
    access_reason,
    was_granted
  ) VALUES (
    v_user_id,
    v_user_email,
    p_table_name,
    p_record_id,
    p_column_name,
    p_access_type,
    p_access_reason,
    true
  );
END;
$$;

-- وظيفة لتحقق من سياسة الاحتفاظ
CREATE OR REPLACE FUNCTION check_file_retention_eligibility(
  p_file_category TEXT,
  p_uploaded_at TIMESTAMPTZ
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_retention_days INTEGER;
  v_auto_delete BOOLEAN;
BEGIN
  SELECT retention_days, auto_delete
  INTO v_retention_days, v_auto_delete
  FROM file_retention_policies
  WHERE file_category = p_file_category
    AND is_active = true
  ORDER BY created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- التحقق من تجاوز فترة الاحتفاظ
  IF v_auto_delete AND (now() - p_uploaded_at) > (v_retention_days || ' days')::INTERVAL THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- ============================================
-- إدراج سياسات احتفاظ افتراضية
-- ============================================

INSERT INTO file_retention_policies (
  policy_name,
  file_category,
  retention_days,
  auto_delete,
  requires_approval,
  is_active
) VALUES
  ('عقود منتهية', 'expired_contracts', 365 * 7, false, true, true),
  ('مستندات مستفيدين محذوفين', 'deleted_beneficiary_docs', 365 * 5, true, true, true),
  ('مستندات مؤقتة', 'temporary_uploads', 30, true, false, true),
  ('نسخ احتياطية قديمة', 'old_backups', 90, true, true, true),
  ('سجلات النظام القديمة', 'old_system_logs', 180, true, false, true)
ON CONFLICT (policy_name) DO NOTHING;

COMMENT ON TABLE encryption_keys IS 'إدارة مفاتيح التشفير وتدويرها - يُحظر التعديل بدون موافقة الناظر';
COMMENT ON TABLE encrypted_files IS 'سجل الملفات المشفرة مع metadata التشفير';
COMMENT ON TABLE file_retention_policies IS 'سياسات الاحتفاظ بالملفات والحذف التلقائي';
COMMENT ON TABLE deleted_files_audit IS 'سجل الملفات المحذوفة للمراجعة والامتثال - لا يُحذف';
COMMENT ON TABLE sensitive_data_access_log IS 'تسجيل كل عمليات الوصول للبيانات الحساسة - محمي';

-- ============================================
-- نهاية Migration
-- ============================================