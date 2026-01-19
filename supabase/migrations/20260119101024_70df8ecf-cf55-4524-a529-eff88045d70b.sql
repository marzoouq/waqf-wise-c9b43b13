
-- ======================================
-- تأمين ملفات الأرشيف من التعديل غير المصرح
-- ======================================

-- حذف السياسات المفتوحة
DROP POLICY IF EXISTS "Archive docs: authenticated update" ON storage.objects;
DROP POLICY IF EXISTS "Archive docs: authenticated delete" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update archive documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete archive documents" ON storage.objects;
DROP POLICY IF EXISTS "Archive docs: authenticated upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload archive documents" ON storage.objects;
DROP POLICY IF EXISTS "Archive docs: public read" ON storage.objects;

-- إنشاء سياسات آمنة للأرشيف - الموظفون فقط
CREATE POLICY "archive_staff_upload"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'archive-documents' 
    AND (public.has_staff_access() OR public.is_admin_or_nazer())
  );

CREATE POLICY "archive_staff_update"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'archive-documents' 
    AND (public.has_staff_access() OR public.is_admin_or_nazer())
  );

CREATE POLICY "archive_staff_delete"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'archive-documents' 
    AND (public.has_staff_access() OR public.is_admin_or_nazer())
  );

CREATE POLICY "archive_staff_read"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'archive-documents' 
    AND (public.has_staff_access() OR public.is_admin_or_nazer())
  );
