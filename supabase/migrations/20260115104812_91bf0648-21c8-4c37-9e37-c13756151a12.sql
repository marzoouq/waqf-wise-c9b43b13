-- ============================================
-- إصلاح الثغرات الأمنية المتبقية
-- ============================================

-- 1. إصلاح system_error_logs RLS (خطورة متوسطة)
-- حذف السياسات المفتوحة
DROP POLICY IF EXISTS "Authenticated users can view error logs" ON public.system_error_logs;
DROP POLICY IF EXISTS "Authenticated users can update error logs" ON public.system_error_logs;

-- إنشاء سياسة مقيدة للقراءة
CREATE POLICY "staff_view_error_logs"
ON public.system_error_logs FOR SELECT
USING (public.is_admin_or_nazer() OR public.has_staff_access());

-- إنشاء سياسة مقيدة للتعديل
CREATE POLICY "staff_update_error_logs"
ON public.system_error_logs FOR UPDATE
USING (public.is_admin_or_nazer() OR public.has_staff_access());

-- 2. تأمين Storage Buckets (خطورة عالية)
UPDATE storage.buckets 
SET public = false 
WHERE name IN ('documents', 'archive-documents');

-- 3. إضافة سياسات RLS للـ Storage Objects
-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "staff_read_documents" ON storage.objects;
DROP POLICY IF EXISTS "staff_upload_documents" ON storage.objects;
DROP POLICY IF EXISTS "staff_delete_documents" ON storage.objects;

-- سياسة القراءة - الموظفين والمستفيدين لملفاتهم
CREATE POLICY "staff_read_documents"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('documents', 'archive-documents') 
  AND (
    public.has_staff_access() 
    OR public.is_admin_or_nazer()
    OR (
      -- السماح للمستفيدين بقراءة مستنداتهم فقط
      EXISTS (
        SELECT 1 FROM public.beneficiaries b
        WHERE b.user_id = auth.uid()
        AND name LIKE (b.id::text || '/%')
      )
    )
  )
);

-- سياسة الرفع - الموظفين فقط
CREATE POLICY "staff_upload_documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('documents', 'archive-documents') 
  AND (public.has_staff_access() OR public.is_admin_or_nazer())
);

-- سياسة الحذف - الموظفين فقط
CREATE POLICY "staff_delete_documents"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('documents', 'archive-documents') 
  AND (public.has_staff_access() OR public.is_admin_or_nazer())
);