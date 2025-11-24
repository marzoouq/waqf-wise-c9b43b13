-- إضافة RLS policies لجدول request_workflows (فقط الأدوار الموجودة)
ALTER TABLE request_workflows ENABLE ROW LEVEL SECURITY;

-- السماح لجميع المستخدمين المصرح لهم بقراءة workflows
CREATE POLICY "Users can view their assigned workflows"
ON request_workflows
FOR SELECT
USING (
  assigned_to = auth.uid() OR
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer', 'accountant')
  )
);

-- السماح للموظفين بتحديث workflows
CREATE POLICY "Staff can update workflows"
ON request_workflows
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'accountant')
  )
);

-- السماح للنظام بإنشاء workflows
CREATE POLICY "System can create workflows"
ON request_workflows
FOR INSERT
WITH CHECK (true);