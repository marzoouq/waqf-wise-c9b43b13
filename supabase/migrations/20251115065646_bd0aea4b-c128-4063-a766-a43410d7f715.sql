-- إصلاح جدول tasks - إضافة عمود assigned_to المفقود
-- =====================================================

-- 1. إضافة عمود assigned_to
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. إضافة عمود created_by للتتبع
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 3. إضافة عمود due_date
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS due_date DATE;

-- 4. إضافة عمود description
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS description TEXT;

-- 5. تحديث السياسات بشكل صحيح
DROP POLICY IF EXISTS "Staff can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Staff can manage their tasks" ON tasks;

CREATE POLICY "Staff can view all tasks"
ON tasks FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'nazer')
  OR has_role(auth.uid(), 'accountant')
  OR has_role(auth.uid(), 'archivist')
  OR has_role(auth.uid(), 'cashier')
  OR assigned_to = auth.uid()
);

CREATE POLICY "Staff can create tasks"
ON tasks FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'nazer')
);

CREATE POLICY "Admins and assigned users can update tasks"
ON tasks FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin')
  OR assigned_to = auth.uid()
)
WITH CHECK (
  has_role(auth.uid(), 'admin')
  OR assigned_to = auth.uid()
);

CREATE POLICY "Only admins can delete tasks"
ON tasks FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 6. إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);