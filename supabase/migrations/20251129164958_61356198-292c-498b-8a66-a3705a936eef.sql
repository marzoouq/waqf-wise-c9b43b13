-- إنشاء bucket للأرشيف
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'archive-documents',
  'archive-documents',
  true,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- سياسة القراءة للجميع (المستندات العامة)
CREATE POLICY "Archive documents are viewable by authenticated users"
ON storage.objects FOR SELECT
USING (bucket_id = 'archive-documents' AND auth.role() = 'authenticated');

-- سياسة الرفع للمستخدمين المسجلين
CREATE POLICY "Authenticated users can upload archive documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'archive-documents' AND auth.role() = 'authenticated');

-- سياسة التحديث
CREATE POLICY "Authenticated users can update archive documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'archive-documents' AND auth.role() = 'authenticated');

-- سياسة الحذف
CREATE POLICY "Authenticated users can delete archive documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'archive-documents' AND auth.role() = 'authenticated');

-- إضافة عمود file_path للمستندات
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_path TEXT;

-- إضافة عمود storage_path للمستندات
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS storage_path TEXT;