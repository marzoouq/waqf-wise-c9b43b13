-- تنظيف سياسات RLS المكررة على جدول properties
-- حذف السياسات القديمة المتضاربة
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم" ON properties;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة جميع العق" ON properties;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة معلومات ا" ON properties;

-- إنشاء سياسة واحدة بسيطة وواضحة للقراءة
CREATE POLICY "المستفيدون والإداريون يمكنهم قراءة العقارات"
ON properties
FOR SELECT
TO authenticated
USING (
  -- المستفيدون يمكنهم قراءة جميع العقارات
  has_role(auth.uid(), 'beneficiary'::app_role)
  OR
  -- الإداريون يمكنهم قراءة جميع العقارات
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR has_role(auth.uid(), 'cashier'::app_role)
  OR has_role(auth.uid(), 'archivist'::app_role)
);