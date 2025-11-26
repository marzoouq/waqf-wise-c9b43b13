-- تعديل سياسة القراءة للسماح لجميع المستخدمين المصادق عليهم
DROP POLICY IF EXISTS "Allow nazer and admin to view documentation" ON project_documentation;

CREATE POLICY "Allow authenticated users to view documentation"
ON project_documentation
FOR SELECT
TO authenticated
USING (true);

-- إبقاء سياسات الكتابة للـ nazer و admin فقط
DROP POLICY IF EXISTS "Allow nazer and admin to insert documentation" ON project_documentation;
DROP POLICY IF EXISTS "Allow nazer and admin to update documentation" ON project_documentation;

CREATE POLICY "Allow nazer and admin to insert documentation"
ON project_documentation
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM current_user_roles
    WHERE user_id = auth.uid()
    AND role = ANY(ARRAY['nazer'::app_role, 'admin'::app_role])
  )
);

CREATE POLICY "Allow nazer and admin to update documentation"
ON project_documentation
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM current_user_roles
    WHERE user_id = auth.uid()
    AND role = ANY(ARRAY['nazer'::app_role, 'admin'::app_role])
  )
);