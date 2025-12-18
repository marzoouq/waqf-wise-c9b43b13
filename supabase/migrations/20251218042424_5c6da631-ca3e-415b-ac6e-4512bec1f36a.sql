
-- =====================================================
-- المرحلة 1: إنشاء الدوال المحسّنة للتحقق من الأدوار
-- =====================================================

-- دالة موحدة للتحقق من وصول الموظفين (مع LIMIT 1 للأداء)
CREATE OR REPLACE FUNCTION public.has_staff_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = ANY(ARRAY['admin', 'nazer', 'accountant', 'cashier', 'archivist']::app_role[])
    LIMIT 1
  );
$$;

-- دالة للوصول الكامل (موظفين + ورثة + مستفيدين)
CREATE OR REPLACE FUNCTION public.has_full_read_access()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = ANY(ARRAY['admin', 'nazer', 'accountant', 'cashier', 'archivist', 'waqf_heir', 'beneficiary']::app_role[])
    LIMIT 1
  );
$$;

-- =====================================================
-- المرحلة 2: توحيد سياسات جدول contracts (17 → 4)
-- =====================================================

-- حذف جميع السياسات الحالية لـ contracts
DROP POLICY IF EXISTS "Staff manage contracts" ON contracts;
DROP POLICY IF EXISTS "staff_manage_contracts" ON contracts;
DROP POLICY IF EXISTS "Admins can delete contracts" ON contracts;
DROP POLICY IF EXISTS "contracts_delete_unified" ON contracts;
DROP POLICY IF EXISTS "Admins can insert contracts" ON contracts;
DROP POLICY IF EXISTS "contracts_insert_unified" ON contracts;
DROP POLICY IF EXISTS "Staff view contracts" ON contracts;
DROP POLICY IF EXISTS "contract_view_policy" ON contracts;
DROP POLICY IF EXISTS "contracts_select_unified" ON contracts;
DROP POLICY IF EXISTS "staff_and_heirs_view_contracts" ON contracts;
DROP POLICY IF EXISTS "staff_view_contracts" ON contracts;
DROP POLICY IF EXISTS "waqf_heir_view_contracts" ON contracts;
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON contracts;
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم " ON contracts;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة جميع العق" ON contracts;
DROP POLICY IF EXISTS "Admins can update contracts" ON contracts;
DROP POLICY IF EXISTS "contracts_update_unified" ON contracts;

-- إنشاء 4 سياسات موحدة فقط
CREATE POLICY "contracts_select" ON contracts FOR SELECT TO authenticated
USING (has_full_read_access());

CREATE POLICY "contracts_insert" ON contracts FOR INSERT TO authenticated
WITH CHECK (is_staff_only());

CREATE POLICY "contracts_update" ON contracts FOR UPDATE TO authenticated
USING (is_staff_only());

CREATE POLICY "contracts_delete" ON contracts FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- =====================================================
-- المرحلة 3: توحيد سياسات جدول properties (16 → 4)
-- =====================================================

DROP POLICY IF EXISTS "staff_manage_properties" ON properties;
DROP POLICY IF EXISTS "Admins can delete properties" ON properties;
DROP POLICY IF EXISTS "properties_delete_unified" ON properties;
DROP POLICY IF EXISTS "Admins can insert properties" ON properties;
DROP POLICY IF EXISTS "properties_insert_unified" ON properties;
DROP POLICY IF EXISTS "beneficiary_read_only_properties" ON properties;
DROP POLICY IF EXISTS "properties_select_unified" ON properties;
DROP POLICY IF EXISTS "staff_and_heirs_view_properties" ON properties;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_properties" ON properties;
DROP POLICY IF EXISTS "staff_view_properties" ON properties;
DROP POLICY IF EXISTS "waqf_heir_view_properties" ON properties;
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم " ON properties;
DROP POLICY IF EXISTS "المستفيدون والإداريون يمكنهم قراء" ON properties;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية العقارات" ON properties;
DROP POLICY IF EXISTS "Admins can update properties" ON properties;
DROP POLICY IF EXISTS "properties_update_unified" ON properties;

CREATE POLICY "properties_select" ON properties FOR SELECT TO authenticated
USING (auth.uid() IS NOT NULL);

CREATE POLICY "properties_insert" ON properties FOR INSERT TO authenticated
WITH CHECK (is_staff_only());

CREATE POLICY "properties_update" ON properties FOR UPDATE TO authenticated
USING (is_staff_only());

CREATE POLICY "properties_delete" ON properties FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- =====================================================
-- المرحلة 4: توحيد سياسات accounts (7 → 4)
-- =====================================================

DROP POLICY IF EXISTS "financial_staff_manage_accounts" ON accounts;
DROP POLICY IF EXISTS "المحاسبون فقط يمكنهم إضافة حسابات" ON accounts;
DROP POLICY IF EXISTS "financial_staff_view_accounts" ON accounts;
DROP POLICY IF EXISTS "الأدوار المالية فقط يمكنها قراءة ا" ON accounts;
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON accounts;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة جميع الحس" ON accounts;
DROP POLICY IF EXISTS "المحاسبون فقط يمكنهم تحديث الحساب" ON accounts;

CREATE POLICY "accounts_select" ON accounts FOR SELECT TO authenticated
USING (is_financial_staff() OR is_heir());

CREATE POLICY "accounts_insert" ON accounts FOR INSERT TO authenticated
WITH CHECK (is_financial_staff());

CREATE POLICY "accounts_update" ON accounts FOR UPDATE TO authenticated
USING (is_financial_staff());

CREATE POLICY "accounts_delete" ON accounts FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- =====================================================
-- المرحلة 4: توحيد سياسات journal_entry_lines (9 → 4)
-- =====================================================

DROP POLICY IF EXISTS "Staff manage journal lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "staff_manage_journal_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "Staff view journal lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "staff_view_journal_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "jel_delete_unified" ON journal_entry_lines;
DROP POLICY IF EXISTS "jel_insert_unified" ON journal_entry_lines;
DROP POLICY IF EXISTS "jel_select_unified" ON journal_entry_lines;
DROP POLICY IF EXISTS "jel_update_unified" ON journal_entry_lines;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة بنود القي" ON journal_entry_lines;

CREATE POLICY "jel_select" ON journal_entry_lines FOR SELECT TO authenticated
USING (is_financial_staff() OR is_heir());

CREATE POLICY "jel_insert" ON journal_entry_lines FOR INSERT TO authenticated
WITH CHECK (is_financial_staff());

CREATE POLICY "jel_update" ON journal_entry_lines FOR UPDATE TO authenticated
USING (is_financial_staff());

CREATE POLICY "jel_delete" ON journal_entry_lines FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- =====================================================
-- المرحلة 4: توحيد سياسات support_tickets (15 → 4)
-- =====================================================

DROP POLICY IF EXISTS "staff_manage_tickets" ON support_tickets;
DROP POLICY IF EXISTS "Staff manage support tickets" ON support_tickets;
DROP POLICY IF EXISTS "staff_view_tickets" ON support_tickets;
DROP POLICY IF EXISTS "tickets_delete_unified" ON support_tickets;
DROP POLICY IF EXISTS "tickets_insert_unified" ON support_tickets;
DROP POLICY IF EXISTS "tickets_select_unified" ON support_tickets;
DROP POLICY IF EXISTS "tickets_update_unified" ON support_tickets;
DROP POLICY IF EXISTS "users_create_tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "users_view_own_tickets" ON support_tickets;
DROP POLICY IF EXISTS "users_update_own_tickets" ON support_tickets;
DROP POLICY IF EXISTS "المستخدمون يمكنهم إنشاء تذاكر الد" ON support_tickets;
DROP POLICY IF EXISTS "المستخدمون يمكنهم تحديث تذاكرهم" ON support_tickets;
DROP POLICY IF EXISTS "المستخدمون يمكنهم رؤية تذاكرهم" ON support_tickets;
DROP POLICY IF EXISTS "الموظفون يمكنهم رؤية جميع التذاكر" ON support_tickets;

CREATE POLICY "tickets_select" ON support_tickets FOR SELECT TO authenticated
USING (user_id = auth.uid() OR is_staff_only());

CREATE POLICY "tickets_insert" ON support_tickets FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "tickets_update" ON support_tickets FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR is_staff_only());

CREATE POLICY "tickets_delete" ON support_tickets FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- =====================================================
-- المرحلة 4: توحيد سياسات cash_flows (7 → 4)
-- =====================================================

DROP POLICY IF EXISTS "financial_staff_manage_cash_flows" ON cash_flows;
DROP POLICY IF EXISTS "financial_staff_view_cash_flows" ON cash_flows;
DROP POLICY IF EXISTS "cash_flows_delete_unified" ON cash_flows;
DROP POLICY IF EXISTS "cash_flows_insert_unified" ON cash_flows;
DROP POLICY IF EXISTS "cash_flows_select_unified" ON cash_flows;
DROP POLICY IF EXISTS "cash_flows_update_unified" ON cash_flows;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة التدفقات" ON cash_flows;

CREATE POLICY "cash_flows_select" ON cash_flows FOR SELECT TO authenticated
USING (is_financial_staff() OR is_heir());

CREATE POLICY "cash_flows_insert" ON cash_flows FOR INSERT TO authenticated
WITH CHECK (is_financial_staff());

CREATE POLICY "cash_flows_update" ON cash_flows FOR UPDATE TO authenticated
USING (is_financial_staff());

CREATE POLICY "cash_flows_delete" ON cash_flows FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- =====================================================
-- المرحلة 4: توحيد سياسات families (9 → 4)
-- =====================================================

DROP POLICY IF EXISTS "staff_manage_families" ON families;
DROP POLICY IF EXISTS "Staff manage families" ON families;
DROP POLICY IF EXISTS "staff_view_families" ON families;
DROP POLICY IF EXISTS "families_delete_unified" ON families;
DROP POLICY IF EXISTS "families_insert_unified" ON families;
DROP POLICY IF EXISTS "families_select_unified" ON families;
DROP POLICY IF EXISTS "families_update_unified" ON families;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية عائلاتهم" ON families;
DROP POLICY IF EXISTS "الموظفون يمكنهم إدارة العائلات" ON families;

CREATE POLICY "families_select" ON families FOR SELECT TO authenticated
USING (has_full_read_access());

CREATE POLICY "families_insert" ON families FOR INSERT TO authenticated
WITH CHECK (is_staff_only());

CREATE POLICY "families_update" ON families FOR UPDATE TO authenticated
USING (is_staff_only());

CREATE POLICY "families_delete" ON families FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- =====================================================
-- المرحلة 4: توحيد سياسات fiscal_years (7 → 4)
-- =====================================================

DROP POLICY IF EXISTS "staff_manage_fiscal_years" ON fiscal_years;
DROP POLICY IF EXISTS "Staff manage fiscal years" ON fiscal_years;
DROP POLICY IF EXISTS "staff_view_fiscal_years" ON fiscal_years;
DROP POLICY IF EXISTS "fiscal_years_delete_unified" ON fiscal_years;
DROP POLICY IF EXISTS "fiscal_years_insert_unified" ON fiscal_years;
DROP POLICY IF EXISTS "fiscal_years_select_unified" ON fiscal_years;
DROP POLICY IF EXISTS "fiscal_years_update_unified" ON fiscal_years;

CREATE POLICY "fiscal_years_select" ON fiscal_years FOR SELECT TO authenticated
USING (has_full_read_access());

CREATE POLICY "fiscal_years_insert" ON fiscal_years FOR INSERT TO authenticated
WITH CHECK (is_admin_or_nazer());

CREATE POLICY "fiscal_years_update" ON fiscal_years FOR UPDATE TO authenticated
USING (is_admin_or_nazer());

CREATE POLICY "fiscal_years_delete" ON fiscal_years FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- =====================================================
-- المرحلة 5: حذف السياسات المكررة في الجداول الصغيرة
-- =====================================================

-- user_sessions
DROP POLICY IF EXISTS "users_can_read_their_sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users view own sessions" ON user_sessions;

-- permissions
DROP POLICY IF EXISTS "Anyone can view permissions" ON permissions;

-- audit_logs
DROP POLICY IF EXISTS "المسؤولون يمكنهم عرض سجل العمليات" ON audit_logs;

-- property_units
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة معلومات ا" ON property_units;

-- push_subscriptions
DROP POLICY IF EXISTS "المستخدمون يمكنهم إدارة اشتراكاته" ON push_subscriptions;

-- search_history
DROP POLICY IF EXISTS "Users can view their search history" ON search_history;

-- two_factor_secrets
DROP POLICY IF EXISTS "المستخدمون يمكنهم إدارة 2FA الخاص ب" ON two_factor_secrets;

-- role_permissions
DROP POLICY IF EXISTS "Anyone can view role permissions" ON role_permissions;

-- =====================================================
-- تحديث إحصائيات الجداول المتأثرة
-- =====================================================

ANALYZE contracts;
ANALYZE properties;
ANALYZE accounts;
ANALYZE journal_entry_lines;
ANALYZE support_tickets;
ANALYZE cash_flows;
ANALYZE families;
ANALYZE fiscal_years;
ANALYZE user_roles;
