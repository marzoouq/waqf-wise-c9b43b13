
-- =====================================================
-- تنظيف السياسات المتبقية في cash_flows
-- =====================================================

DROP POLICY IF EXISTS "Allow authenticated insert on cash_flows" ON cash_flows;
DROP POLICY IF EXISTS "Financial staff view cash flows" ON cash_flows;
DROP POLICY IF EXISTS "Users can view cash flows" ON cash_flows;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_cash_flows" ON cash_flows;
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON cash_flows;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة التدفقات " ON cash_flows;

-- =====================================================
-- تنظيف السياسات المتبقية في families
-- =====================================================

DROP POLICY IF EXISTS "Staff and related beneficiaries view families" ON families;
DROP POLICY IF EXISTS "Staff can delete families" ON families;
DROP POLICY IF EXISTS "Staff can insert families" ON families;
DROP POLICY IF EXISTS "Staff can update families" ON families;
DROP POLICY IF EXISTS "member_view_own_family" ON families;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_families" ON families;
DROP POLICY IF EXISTS "waqf_heir_view_families" ON families;

-- =====================================================
-- تنظيف السياسات المتبقية في fiscal_years
-- =====================================================

DROP POLICY IF EXISTS "الأدوار المالية يمكنها رؤية السنو" ON fiscal_years;
DROP POLICY IF EXISTS "المسؤولون فقط يمكنهم إضافة سنوات م" ON fiscal_years;
DROP POLICY IF EXISTS "المسؤولون فقط يمكنهم تحديث السنوا" ON fiscal_years;
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON fiscal_years;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة السنوات ا" ON fiscal_years;

-- تحديث الإحصائيات النهائية
ANALYZE cash_flows;
ANALYZE families;
ANALYZE fiscal_years;
ANALYZE user_roles;
