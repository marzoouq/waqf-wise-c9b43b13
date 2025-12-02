-- تفعيل RLS وإضافة السياسات لجدول fiscal_year_closings

-- تفعيل RLS
ALTER TABLE fiscal_year_closings ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة: الموظفون والإداريون والناظر يمكنهم رؤية جميع عمليات الإقفال
CREATE POLICY "Staff can view all fiscal year closings"
  ON fiscal_year_closings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
    )
  );

-- سياسة الإنشاء: الناظر والإداريون والمحاسبون فقط يمكنهم إنشاء عمليات إقفال
CREATE POLICY "Authorized staff can create fiscal year closings"
  ON fiscal_year_closings
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant')
    )
  );

-- سياسة التحديث: الناظر والإداريون فقط يمكنهم تعديل عمليات الإقفال
CREATE POLICY "Admin and nazer can update fiscal year closings"
  ON fiscal_year_closings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer')
    )
  );

-- سياسة الحذف: الإداريون فقط يمكنهم حذف عمليات الإقفال
CREATE POLICY "Admin can delete fiscal year closings"
  ON fiscal_year_closings
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );