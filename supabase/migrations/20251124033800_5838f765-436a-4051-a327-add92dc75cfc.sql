-- إزالة أي صلاحيات تعديل للمستفيدين وضمان القراءة فقط

-- حذف السياسات القديمة بأسماء صحيحة
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة العقود" ON contracts;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة العقارات" ON properties;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة المدفوعات" ON payments;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة مدفوعاتهم" ON payments;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة التوزيعات" ON distributions;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة سندات الصرف" ON payment_vouchers;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة الوحدات" ON property_units;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة دفعات الإيجار" ON rental_payments;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة القيود" ON journal_entries;
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم قراءة القيود" ON journal_entries;

-- إنشاء سياسات قراءة فقط للمستفيدين

-- جدول contracts - قراءة فقط
CREATE POLICY "beneficiary_read_only_contracts"
ON contracts FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'beneficiary'::app_role)
);

-- جدول properties - قراءة فقط
CREATE POLICY "beneficiary_read_only_properties"
ON properties FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'beneficiary'::app_role)
);

-- جدول payments - قراءة مدفوعاتهم فقط
CREATE POLICY "beneficiary_read_own_payments"
ON payments FOR SELECT
TO authenticated
USING (
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  ) OR
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'cashier'::app_role)
);

-- جدول distributions - قراءة فقط
CREATE POLICY "beneficiary_read_only_distributions"
ON distributions FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'beneficiary'::app_role)
);

-- جدول payment_vouchers - قراءة فقط
CREATE POLICY "beneficiary_read_only_vouchers"
ON payment_vouchers FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'beneficiary'::app_role)
);

-- جدول property_units - قراءة فقط
CREATE POLICY "beneficiary_read_only_units"
ON property_units FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'beneficiary'::app_role)
);

-- جدول rental_payments - قراءة فقط
CREATE POLICY "beneficiary_read_only_rental_payments"
ON rental_payments FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR
  has_role(auth.uid(), 'beneficiary'::app_role)
);

-- جدول journal_entries - الفئة الأولى فقط قراءة
CREATE POLICY "first_class_read_only_entries"
ON journal_entries FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR
  (EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  ))
);