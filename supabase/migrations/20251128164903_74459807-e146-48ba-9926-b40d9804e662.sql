-- ✅ تأمين حاوية request-attachments - إصلاح أمني
-- جعل الحاوية خاصة بدلاً من عامة

UPDATE storage.buckets 
SET public = false 
WHERE id = 'request-attachments';

-- إضافة سياسات RLS للتخزين الآمن

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "Authenticated users can upload request attachments" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own attachments" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all attachments" ON storage.objects;

-- سياسة رفع المرفقات للمستخدمين المصادقين فقط
CREATE POLICY "Authenticated users can upload request attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'request-attachments' 
  AND auth.uid() IS NOT NULL
);

-- سياسة عرض المرفقات الخاصة بالمستخدم
CREATE POLICY "Users can view their own attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'request-attachments'
  AND (
    -- المستخدم يمكنه رؤية ملفاته
    (storage.foldername(name))[1] = auth.uid()::text
    OR
    -- أو لديه دور إداري
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('nazer', 'admin', 'accountant')
    )
  )
);

-- سياسة حذف المرفقات
CREATE POLICY "Users can delete their own attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'request-attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- تسجيل التغيير الأمني
INSERT INTO audit_logs (action_type, description, severity)
VALUES ('security_fix', 'تأمين حاوية request-attachments وإضافة سياسات RLS', 'info');