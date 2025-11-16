
-- إصلاح RLS policies الضعيفة للحماية الكاملة

-- 1. إصلاح profiles - حذف الـ policies الضعيفة
DROP POLICY IF EXISTS "Allow authenticated read on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated update on profiles" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated insert on profiles" ON profiles;

-- policies محسّنة للأمان
CREATE POLICY "Staff can view all profiles for admin purposes"
ON profiles FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
);

-- 2. إصلاح invoice_lines - حذف الـ policies الضعيفة
DROP POLICY IF EXISTS "Allow authenticated read on invoice_lines" ON invoice_lines;
DROP POLICY IF EXISTS "Allow authenticated update on invoice_lines" ON invoice_lines;
DROP POLICY IF EXISTS "Allow authenticated insert on invoice_lines" ON invoice_lines;

-- policies محسّنة - فقط الموظفون الماليون
CREATE POLICY "Financial staff can view invoice lines"
ON invoice_lines FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role) 
  OR has_role(auth.uid(), 'accountant'::app_role)
);

CREATE POLICY "Accountants can manage invoice lines"
ON invoice_lines FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'accountant'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'accountant'::app_role)
);

-- 3. إصلاح maintenance_requests - حذف policy ضعيف
DROP POLICY IF EXISTS "Authenticated users can view maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "Authenticated users can create maintenance" ON maintenance_requests;

-- policy محسّن - فقط الموظفون المعتمدون والمستفيدون من الفئة الأولى
CREATE POLICY "Authorized staff can view all maintenance"
ON maintenance_requests FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role) 
  OR has_role(auth.uid(), 'archivist'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);

CREATE POLICY "Authorized staff can create maintenance"
ON maintenance_requests FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'archivist'::app_role)
);

-- 4. إصلاح rental_payments - حذف policy ضعيف
DROP POLICY IF EXISTS "Authenticated users can view payments" ON rental_payments;

-- policy محسّن - فقط الموظفون الماليون والمستفيدون من الفئة الأولى
CREATE POLICY "Financial staff can view all payments"
ON rental_payments FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role) 
  OR has_role(auth.uid(), 'accountant'::app_role) 
  OR has_role(auth.uid(), 'cashier'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);
