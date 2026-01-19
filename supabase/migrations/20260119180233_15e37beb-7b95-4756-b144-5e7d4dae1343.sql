-- إزالة السياسات المكررة والمتساهلة في جداول الموافقات
-- ===============================

-- 1. distribution_approvals - إزالة السياسة المتساهلة
DROP POLICY IF EXISTS "Authenticated users can view approvals" ON public.distribution_approvals;

-- 2. loan_approvals - إزالة السياسات المكررة وتوحيدها
DROP POLICY IF EXISTS "المسؤولون والمحاسبون يمكنهم إدارة" ON public.loan_approvals;
DROP POLICY IF EXISTS "المسؤولون والمحاسبون يمكنهم رؤية " ON public.loan_approvals;
DROP POLICY IF EXISTS "staff_read_loan_approvals" ON public.loan_approvals;

-- 3. payment_approvals - إزالة السياسات المكررة
DROP POLICY IF EXISTS "المسؤولون والمحاسبون يمكنهم إدارة" ON public.payment_approvals;
DROP POLICY IF EXISTS "المسؤولون والمحاسبون يمكنهم رؤية " ON public.payment_approvals;
DROP POLICY IF EXISTS "staff_read_payment_approvals" ON public.payment_approvals;