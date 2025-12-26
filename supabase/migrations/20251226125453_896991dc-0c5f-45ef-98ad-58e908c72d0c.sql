
-- 1. تحديث bucket الأرشيف ليكون عام (لأن الوصول للمستندات محكوم بـ RLS)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'archive-documents';

-- 2. إصلاح سياسات RLS لجدول folders - السماح للموظفين برؤية المجلدات
DROP POLICY IF EXISTS "الأرشيفيون والمسؤولون يمكنهم رؤية" ON public.folders;

CREATE POLICY "Authenticated users can view folders"
ON public.folders
FOR SELECT
TO authenticated
USING (true);

-- 3. تحديث سياسات INSERT للـ authenticated
DROP POLICY IF EXISTS "الأرشيفيون والمسؤولون يمكنهم إضاف" ON public.folders;

CREATE POLICY "Staff can create folders"
ON public.folders
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'archivist'::app_role)
);

-- 4. تحديث سياسات UPDATE للـ authenticated
DROP POLICY IF EXISTS "الأرشيفيون والمسؤولون يمكنهم تحدي" ON public.folders;

CREATE POLICY "Staff can update folders"
ON public.folders
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'archivist'::app_role)
);
