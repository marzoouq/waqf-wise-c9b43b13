-- إضافة صلاحية للورثة لرؤية العقارات فقط
-- Waqf heirs can view properties (Waqf assets) but not tenant data

-- حذف السياسات القديمة للعقارات
DROP POLICY IF EXISTS "waqf_heirs_can_view_properties" ON properties;
DROP POLICY IF EXISTS "staff_view_properties" ON properties;
DROP POLICY IF EXISTS "staff_manage_properties" ON properties;

-- سياسة جديدة: الموظفون والورثة يمكنهم رؤية العقارات
CREATE POLICY "staff_and_heirs_view_properties"
ON properties FOR SELECT
USING (
  is_staff() OR is_waqf_heir()
);

-- سياسة: الموظفون فقط يمكنهم إدارة العقارات
CREATE POLICY "staff_manage_properties"
ON properties FOR ALL
USING (is_staff());

-- ملاحظات مهمة:
-- ✅ الورثة يمكنهم رؤية العقارات (أصول الوقف)
-- ❌ الورثة لا يرون العقود (بيانات المستأجرين محمية)
-- ❌ الورثة لا يرون دفعات الإيجار (معلومات مالية خاصة)
-- ✅ الورثة يمكنهم رؤية الإفصاحات السنوية (إجمالي الإيرادات)