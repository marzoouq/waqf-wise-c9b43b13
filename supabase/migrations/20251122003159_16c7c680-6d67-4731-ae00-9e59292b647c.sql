-- فتح وصول القراءة الكامل للمستفيدين من الدرجة الأولى
-- لضمان الشفافية التامة في المعاملات المالية للوقف
-- النسخة المصححة

-- ============================================
-- 1. القيود المحاسبية (journal_entries)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة القيود المحاسبية" ON public.journal_entries;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة القيود المحاسبية"
ON public.journal_entries
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);

-- ============================================
-- 2. الحسابات (accounts)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة شجرة الحسابات" ON public.accounts;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة شجرة الحسابات"
ON public.accounts
FOR SELECT
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

-- ============================================
-- 3. مدفوعات الإيجارات (rental_payments)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة مدفوعات الإيجارات" ON public.rental_payments;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة مدفوعات الإيجارات"
ON public.rental_payments
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);

-- ============================================
-- 4. العقود (contracts)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة جميع العقود" ON public.contracts;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة جميع العقود"
ON public.contracts
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);

-- ============================================
-- 5. الميزانيات (budgets)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة الميزانيات" ON public.budgets;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة الميزانيات"
ON public.budgets
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);

-- ============================================
-- 6. التدفقات النقدية (cash_flows)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة التدفقات النقدية" ON public.cash_flows;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة التدفقات النقدية"
ON public.cash_flows
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);

-- ============================================
-- 7. السنوات المالية (fiscal_years)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة السنوات المالية" ON public.fiscal_years;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة السنوات المالية"
ON public.fiscal_years
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);

-- ============================================
-- 8. الحسابات البنكية (bank_accounts)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة الحسابات البنكية" ON public.bank_accounts;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة الحسابات البنكية"
ON public.bank_accounts
FOR SELECT
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

-- ============================================
-- 9. كشوفات الحسابات البنكية (bank_statements)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة كشوفات الحسابات" ON public.bank_statements;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة كشوفات الحسابات"
ON public.bank_statements
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);

-- ============================================
-- 10. معاملات الحسابات البنكية (bank_transactions)
-- ============================================

DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنهم قراءة المعاملات البنكية" ON public.bank_transactions;

CREATE POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة المعاملات البنكية"
ON public.bank_transactions
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
  OR EXISTS (
    SELECT 1 FROM beneficiaries 
    WHERE user_id = auth.uid() 
    AND category = 'الفئة الأولى'
  )
);

-- ============================================
-- تعليقات توثيقية
-- ============================================

COMMENT ON POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة القيود المحاسبية" ON public.journal_entries IS 
'✅ شفافية كاملة: المستفيدون من الدرجة الأولى (14 مستفيد) يمكنهم الاطلاع على جميع القيود المحاسبية والمصروفات';

COMMENT ON POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة شجرة الحسابات" ON public.accounts IS 
'✅ شفافية كاملة: المستفيدون من الدرجة الأولى يمكنهم الاطلاع على شجرة الحسابات وإجمالي الدخل والمصروفات';

COMMENT ON POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة مدفوعات الإيجارات" ON public.rental_payments IS 
'✅ شفافية كاملة: المستفيدون من الدرجة الأولى يمكنهم الاطلاع على مدفوعات الإيجارات وإجمالي الدخل من العقارات';

COMMENT ON POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة جميع العقود" ON public.contracts IS 
'✅ شفافية كاملة: المستفيدون من الدرجة الأولى يمكنهم الاطلاع على جميع عقود الإيجار والوحدات المؤجرة';

COMMENT ON POLICY "المستفيدون من الدرجة الأولى يمكنهم قراءة الحسابات البنكية" ON public.bank_accounts IS 
'✅ شفافية كاملة: المستفيدون من الدرجة الأولى يمكنهم الاطلاع على جميع الحسابات البنكية للوقف';