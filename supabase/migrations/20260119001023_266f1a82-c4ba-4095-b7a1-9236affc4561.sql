-- إصلاح RLS للجداول المفتوحة (الجداول ذات البيانات فقط)

-- 1. permissions (201 سجل) - تقييد للإدارة فقط
DROP POLICY IF EXISTS "Authenticated can view permissions" ON permissions;
CREATE POLICY "admin_nazer_view_permissions" ON permissions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'nazer')
    )
  );

-- 2. role_permissions (580 سجل) - تقييد للإدارة فقط
DROP POLICY IF EXISTS "Authenticated can view role permissions" ON role_permissions;
CREATE POLICY "admin_nazer_view_role_permissions" ON role_permissions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'nazer')
    )
  );

-- 3. folders (4 سجلات) - تقييد للموظفين فقط (لا يوجد created_by)
DROP POLICY IF EXISTS "Authenticated users can view folders" ON folders;
CREATE POLICY "staff_view_folders" ON folders 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'nazer', 'accountant', 'archivist')
    )
  );

-- 4. governance_board_members (2 سجلين) - تقييد للإدارة وأعضاء المجلس
DROP POLICY IF EXISTS "Authenticated users can view board members" ON governance_board_members;
CREATE POLICY "admin_or_member_view_board" ON governance_board_members 
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'nazer')
    ) OR
    EXISTS (
      SELECT 1 FROM governance_board_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- تعليق توثيقي للمراجعة المستقبلية
COMMENT ON POLICY "admin_nazer_view_permissions" ON permissions IS 
  'RLS Fix: تقييد عرض الصلاحيات للإدارة فقط - فحص جنائي 2026-01-19';
COMMENT ON POLICY "admin_nazer_view_role_permissions" ON role_permissions IS 
  'RLS Fix: تقييد عرض صلاحيات الأدوار للإدارة فقط - فحص جنائي 2026-01-19';
COMMENT ON POLICY "staff_view_folders" ON folders IS 
  'RLS Fix: تقييد عرض المجلدات للموظفين فقط - فحص جنائي 2026-01-19';
COMMENT ON POLICY "admin_or_member_view_board" ON governance_board_members IS 
  'RLS Fix: تقييد عرض أعضاء المجلس للإدارة أو الأعضاء - فحص جنائي 2026-01-19';