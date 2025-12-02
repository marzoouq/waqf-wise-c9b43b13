-- إزالة سياسة الحذف القديمة المحدودة
DROP POLICY IF EXISTS "Admins can delete families" ON families;

-- إنشاء سياسة حذف جديدة تسمح للناظر والـ admin
CREATE POLICY "Staff can delete families"
ON families
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

-- تحديث سياسات UPDATE و INSERT أيضاً لتشمل الناظر
DROP POLICY IF EXISTS "Admins can update families" ON families;
DROP POLICY IF EXISTS "Admins can insert families" ON families;

CREATE POLICY "Staff can update families"
ON families
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

CREATE POLICY "Staff can insert families"
ON families
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);