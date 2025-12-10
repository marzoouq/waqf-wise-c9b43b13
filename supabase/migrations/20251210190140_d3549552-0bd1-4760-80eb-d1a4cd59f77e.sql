
-- تعطيل trigger الحماية مؤقتاً
ALTER EVENT TRIGGER protect_first_degree_policies DISABLE;

-- حذف السياسات القديمة من distributions
DROP POLICY IF EXISTS "distributions_select_beneficiary" ON public.distributions;
DROP POLICY IF EXISTS "distributions_select_heirs" ON public.distributions;
DROP POLICY IF EXISTS "distributions_select_staff" ON public.distributions;
DROP POLICY IF EXISTS "الجميع يمكنهم رؤية التوزيعات المع" ON public.distributions;
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم " ON public.distributions;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة جميع التو" ON public.distributions;

-- حذف السياسات القديمة من journal_entries
DROP POLICY IF EXISTS "الأدوار المالية يمكنها رؤية القيو" ON public.journal_entries;
DROP POLICY IF EXISTS "المحاسبون فقط يمكنهم إضافة قيود" ON public.journal_entries;
DROP POLICY IF EXISTS "المحاسبون فقط يمكنهم تحديث القيود" ON public.journal_entries;
DROP POLICY IF EXISTS "المحاسبون والمسؤولون فقط يمكنهم ر" ON public.journal_entries;
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON public.journal_entries;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة القيود ال" ON public.journal_entries;

-- حذف السياسات القديمة من payments
DROP POLICY IF EXISTS "المسؤولون فقط يمكنهم إضافة مدفوعا" ON public.payments;
DROP POLICY IF EXISTS "المسؤولون فقط يمكنهم تحديث مدفوعا" ON public.payments;
DROP POLICY IF EXISTS "المسؤولون فقط يمكنهم حذف مدفوعات" ON public.payments;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية مدفوعاتهم " ON public.payments;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة جميع المد" ON public.payments;

-- حذف السياسات القديمة من rental_payments
DROP POLICY IF EXISTS "beneficiary_read_only_rental_payments" ON public.rental_payments;
DROP POLICY IF EXISTS "financial_staff_update_rental_payments" ON public.rental_payments;
DROP POLICY IF EXISTS "rental_payments_financial_staff" ON public.rental_payments;
DROP POLICY IF EXISTS "rental_payments_view_policy" ON public.rental_payments;
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON public.rental_payments;
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم " ON public.rental_payments;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة جميع الإي" ON public.rental_payments;

-- إعادة تفعيل trigger الحماية
ALTER EVENT TRIGGER protect_first_degree_policies ENABLE;
