-- تنظيف السياسات المتداخلة لتحسين الأداء
-- =====================================================

-- 1. تنظيف payments - الإبقاء على السياسات الموحدة فقط
DROP POLICY IF EXISTS "payments_beneficiary_own" ON public.payments;
DROP POLICY IF EXISTS "payments_beneficiary_self_view" ON public.payments;
DROP POLICY IF EXISTS "payments_select_heirs_own" ON public.payments;
DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
DROP POLICY IF EXISTS "payments_select_staff" ON public.payments;

-- 2. تنظيف distributions - الإبقاء على السياسات الموحدة فقط
DROP POLICY IF EXISTS "distributions_delete_unified" ON public.distributions;
DROP POLICY IF EXISTS "distributions_insert_unified" ON public.distributions;
DROP POLICY IF EXISTS "distributions_update_unified" ON public.distributions;
DROP POLICY IF EXISTS "distributions_staff_manage" ON public.distributions;
DROP POLICY IF EXISTS "staff_manage_distributions" ON public.distributions;
DROP POLICY IF EXISTS "distributions_view" ON public.distributions;

-- إبقاء سياسة القراءة للورثة
-- distributions_heir_access و heirs_view_distributions ضرورية لوصول الورثة

-- 3. تنظيف waqf_distribution_settings
DROP POLICY IF EXISTS "waqf_distribution_settings_admin_all" ON public.waqf_distribution_settings;
DROP POLICY IF EXISTS "waqf_distribution_settings_staff_view" ON public.waqf_distribution_settings;