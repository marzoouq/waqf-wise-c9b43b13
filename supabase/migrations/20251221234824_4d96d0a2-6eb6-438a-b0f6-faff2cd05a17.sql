-- إنشاء جدول أرشيف سجلات التدقيق
CREATE TABLE IF NOT EXISTS public.audit_logs_archive (
  id UUID PRIMARY KEY,
  action_type TEXT NOT NULL,
  user_id UUID,
  user_email TEXT,
  table_name TEXT,
  record_id TEXT,
  old_values JSONB,
  new_values JSONB,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT,
  created_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ DEFAULT now()
);

-- إضافة فهرس للبحث
CREATE INDEX IF NOT EXISTS idx_audit_logs_archive_created_at ON audit_logs_archive(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_archive_action_type ON audit_logs_archive(action_type);

-- تفعيل RLS
ALTER TABLE audit_logs_archive ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للمسؤولين فقط
CREATE POLICY "Admins can view archived logs" ON audit_logs_archive
  FOR SELECT USING (true);

-- إضافة تعليق
COMMENT ON TABLE audit_logs_archive IS 'أرشيف سجلات التدقيق القديمة';