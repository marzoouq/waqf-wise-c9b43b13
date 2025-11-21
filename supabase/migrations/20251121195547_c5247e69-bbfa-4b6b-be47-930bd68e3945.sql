-- تفعيل تسجيل الدخول لجميع المستفيدين من الفئة الأولى
-- Migration: Enable login for first-class beneficiaries

-- تحديث حالة can_login لجميع المستفيدين من الفئة الأولى
UPDATE beneficiaries 
SET can_login = true,
    updated_at = now()
WHERE category = 'الفئة الأولى'
  AND (can_login = false OR can_login IS NULL);

-- إضافة RLS policies للشفافية الكاملة
-- السماح للمستفيدين من الفئة الأولى بمشاهدة العقارات والوحدات والعقود (للقراءة فقط)

-- Policy للعقارات
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية العقارات" ON properties;
CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية العقارات"
ON properties FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
      AND category = 'الفئة الأولى'
  )
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'nazer')
);

-- Policy للوحدات العقارية
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية الوحدات" ON property_units;
CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية الوحدات"
ON property_units FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
      AND category = 'الفئة الأولى'
  )
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'nazer')
);

-- Policy للعقود
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية العقود" ON contracts;
CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية العقود"
ON contracts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
      AND category = 'الفئة الأولى'
  )
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'nazer')
);

-- Policy للإيجارات
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية الإيجارات" ON rental_payments;
CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية الإيجارات"
ON rental_payments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
      AND category = 'الفئة الأولى'
  )
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'nazer')
  OR has_role(auth.uid(), 'accountant')
);

-- Policy للتوزيعات
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية التوزيعات" ON distributions;
CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية التوزيعات"
ON distributions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
      AND category = 'الفئة الأولى'
  )
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'nazer')
  OR has_role(auth.uid(), 'accountant')
);

-- Policy لتفاصيل التوزيعات
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم رؤية تفاصيل التوزيعات" ON distribution_details;
CREATE POLICY "المستفيدون من الفئة الأولى يمكنهم رؤية تفاصيل التوزيعات"
ON distribution_details FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
      AND category = 'الفئة الأولى'
  )
  OR has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'nazer')
  OR has_role(auth.uid(), 'accountant')
);