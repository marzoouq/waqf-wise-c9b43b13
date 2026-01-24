-- ============================================================
-- إصلاح ثغرات RLS الأمنية - المرحلة 2 (مُصحح)
-- ============================================================

-- 1. إصلاح سياسة إدراج الإشعارات (notifications_insert_bypass)
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "system_notifications" ON notifications;

CREATE POLICY "notifications_insert_restricted" ON notifications
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR is_admin_or_nazer()
);

-- 2. إصلاح سياسة سجلات الوصول الحساسة
-- ----------------------------------------------------------------
DROP POLICY IF EXISTS "auth_insert_access_log" ON sensitive_data_access_log;

CREATE POLICY "system_controlled_access_log_insert" ON sensitive_data_access_log
FOR INSERT TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND table_name IS NOT NULL
  AND table_name <> ''
  AND record_id IS NOT NULL
  AND (
    accessed_at IS NULL 
    OR (accessed_at >= NOW() - INTERVAL '2 minutes' AND accessed_at <= NOW() + INTERVAL '10 seconds')
  )
  AND access_type IN ('view', 'export', 'print', 'download', 'search')
);

-- 3. إضافة تعليقات توثيقية
-- ----------------------------------------------------------------
COMMENT ON POLICY "profiles_select_own_or_admin" ON profiles IS 
'المستخدم يقرأ ملفه فقط، المشرف يقرأ الكل';

COMMENT ON POLICY "vouchers_select_unified" ON payment_vouchers IS 
'الموظفون الماليون يقرأون الكل، المستفيد يقرأ سنداته فقط';

-- 4. فهارس لتحسين الأداء
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sensitive_access_log_user_time 
ON sensitive_data_access_log(user_id, accessed_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
ON notifications(user_id, created_at DESC);