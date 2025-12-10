
-- حذف السياسات القديمة للمستأجرين
DROP POLICY IF EXISTS "Staff can manage tenants" ON tenants;
DROP POLICY IF EXISTS "Heirs can view tenants" ON tenants;
DROP POLICY IF EXISTS "Allow read access to tenants" ON tenants;
DROP POLICY IF EXISTS "Allow insert access to tenants" ON tenants;
DROP POLICY IF EXISTS "Allow update access to tenants" ON tenants;
DROP POLICY IF EXISTS "Allow delete access to tenants" ON tenants;

-- سياسات المستأجرين - الناظر والمحاسب: كامل الصلاحيات، الوريث: قراءة فقط
CREATE POLICY "Nazer and Accountant full access to tenants"
ON tenants FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'nazer') OR 
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'nazer') OR 
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Heirs read only tenants"
ON tenants FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'waqf_heir'));

-- حذف السياسات القديمة لتفاصيل الإيجارات التاريخية
DROP POLICY IF EXISTS "Staff can manage historical rental details" ON historical_rental_details;
DROP POLICY IF EXISTS "Heirs can view historical rental details" ON historical_rental_details;
DROP POLICY IF EXISTS "Allow read access to historical_rental_details" ON historical_rental_details;
DROP POLICY IF EXISTS "Allow insert access to historical_rental_details" ON historical_rental_details;
DROP POLICY IF EXISTS "Allow update access to historical_rental_details" ON historical_rental_details;
DROP POLICY IF EXISTS "Allow delete access to historical_rental_details" ON historical_rental_details;

-- سياسات تفاصيل الإيجارات - الناظر والمحاسب: كامل الصلاحيات، الوريث: قراءة فقط
CREATE POLICY "Nazer and Accountant full access to historical rentals"
ON historical_rental_details FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'nazer') OR 
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'nazer') OR 
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Heirs read only historical rentals"
ON historical_rental_details FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'waqf_heir'));

-- حذف السياسات القديمة لإقفالات السنة المالية
DROP POLICY IF EXISTS "Staff can manage fiscal year closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Heirs can view fiscal year closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Allow read access to fiscal_year_closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Allow insert access to fiscal_year_closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Allow update access to fiscal_year_closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Allow delete access to fiscal_year_closings" ON fiscal_year_closings;

-- سياسات إقفالات السنة المالية - الناظر والمحاسب: كامل الصلاحيات، الوريث: قراءة فقط
CREATE POLICY "Nazer and Accountant full access to fiscal closings"
ON fiscal_year_closings FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'nazer') OR 
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  public.has_role(auth.uid(), 'nazer') OR 
  public.has_role(auth.uid(), 'accountant') OR
  public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Heirs read only fiscal closings"
ON fiscal_year_closings FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'waqf_heir'));
