
-- =====================================================
-- المرحلة 6: توحيد 10 جداول إضافية
-- =====================================================

-- 1. maintenance_requests (9 → 4)
DROP POLICY IF EXISTS "Staff manage maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "staff_manage_maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "Staff view maintenance requests" ON maintenance_requests;
DROP POLICY IF EXISTS "staff_view_maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "maintenance_select_unified" ON maintenance_requests;
DROP POLICY IF EXISTS "maintenance_insert_unified" ON maintenance_requests;
DROP POLICY IF EXISTS "maintenance_update_unified" ON maintenance_requests;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية طلبات الصي" ON maintenance_requests;
DROP POLICY IF EXISTS "الموظفون يمكنهم إدارة طلبات الصيا" ON maintenance_requests;

CREATE POLICY "maintenance_select" ON maintenance_requests FOR SELECT TO authenticated
USING (has_full_read_access());

CREATE POLICY "maintenance_insert" ON maintenance_requests FOR INSERT TO authenticated
WITH CHECK (is_staff_only());

CREATE POLICY "maintenance_update" ON maintenance_requests FOR UPDATE TO authenticated
USING (is_staff_only());

CREATE POLICY "maintenance_delete" ON maintenance_requests FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- 2. emergency_aid_requests (8 → 4)
DROP POLICY IF EXISTS "Staff manage emergency requests" ON emergency_aid_requests;
DROP POLICY IF EXISTS "staff_manage_emergency_aid" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_select_unified" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_insert_unified" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_update_unified" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_delete_unified" ON emergency_aid_requests;
DROP POLICY IF EXISTS "beneficiaries_view_own_emergency" ON emergency_aid_requests;
DROP POLICY IF EXISTS "المستفيدون يمكنهم تقديم طلبات مسا" ON emergency_aid_requests;

CREATE POLICY "emergency_select" ON emergency_aid_requests FOR SELECT TO authenticated
USING (beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR is_staff_only());

CREATE POLICY "emergency_insert" ON emergency_aid_requests FOR INSERT TO authenticated
WITH CHECK (beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR is_staff_only());

CREATE POLICY "emergency_update" ON emergency_aid_requests FOR UPDATE TO authenticated
USING (is_staff_only());

CREATE POLICY "emergency_delete" ON emergency_aid_requests FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- 3. invoices (8 → 4)
DROP POLICY IF EXISTS "Staff manage invoices" ON invoices;
DROP POLICY IF EXISTS "staff_manage_invoices" ON invoices;
DROP POLICY IF EXISTS "invoices_select_unified" ON invoices;
DROP POLICY IF EXISTS "invoices_insert_unified" ON invoices;
DROP POLICY IF EXISTS "invoices_update_unified" ON invoices;
DROP POLICY IF EXISTS "invoices_delete_unified" ON invoices;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية الفواتير" ON invoices;
DROP POLICY IF EXISTS "المحاسبون يمكنهم إدارة الفواتير" ON invoices;

CREATE POLICY "invoices_select" ON invoices FOR SELECT TO authenticated
USING (is_financial_staff() OR is_heir());

CREATE POLICY "invoices_insert" ON invoices FOR INSERT TO authenticated
WITH CHECK (is_financial_staff());

CREATE POLICY "invoices_update" ON invoices FOR UPDATE TO authenticated
USING (is_financial_staff());

CREATE POLICY "invoices_delete" ON invoices FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- 4. annual_disclosures (8 → 4)
DROP POLICY IF EXISTS "Staff manage disclosures" ON annual_disclosures;
DROP POLICY IF EXISTS "staff_manage_disclosures" ON annual_disclosures;
DROP POLICY IF EXISTS "disclosures_select_unified" ON annual_disclosures;
DROP POLICY IF EXISTS "disclosures_insert_unified" ON annual_disclosures;
DROP POLICY IF EXISTS "disclosures_update_unified" ON annual_disclosures;
DROP POLICY IF EXISTS "disclosures_delete_unified" ON annual_disclosures;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية الإفصاحات" ON annual_disclosures;
DROP POLICY IF EXISTS "الموظفون يمكنهم إدارة الإفصاحات" ON annual_disclosures;

CREATE POLICY "disclosures_select" ON annual_disclosures FOR SELECT TO authenticated
USING (has_full_read_access());

CREATE POLICY "disclosures_insert" ON annual_disclosures FOR INSERT TO authenticated
WITH CHECK (is_admin_or_nazer());

CREATE POLICY "disclosures_update" ON annual_disclosures FOR UPDATE TO authenticated
USING (is_admin_or_nazer());

CREATE POLICY "disclosures_delete" ON annual_disclosures FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- 5. family_members (8 → 4)
DROP POLICY IF EXISTS "Staff manage family members" ON family_members;
DROP POLICY IF EXISTS "staff_manage_family_members" ON family_members;
DROP POLICY IF EXISTS "family_members_select_unified" ON family_members;
DROP POLICY IF EXISTS "family_members_insert_unified" ON family_members;
DROP POLICY IF EXISTS "family_members_update_unified" ON family_members;
DROP POLICY IF EXISTS "family_members_delete_unified" ON family_members;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية أفراد عائل" ON family_members;
DROP POLICY IF EXISTS "الموظفون يمكنهم إدارة أفراد العائ" ON family_members;

CREATE POLICY "family_members_select" ON family_members FOR SELECT TO authenticated
USING (has_full_read_access());

CREATE POLICY "family_members_insert" ON family_members FOR INSERT TO authenticated
WITH CHECK (is_staff_only());

CREATE POLICY "family_members_update" ON family_members FOR UPDATE TO authenticated
USING (is_staff_only());

CREATE POLICY "family_members_delete" ON family_members FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- 6. budgets (7 → 4)
DROP POLICY IF EXISTS "Staff manage budgets" ON budgets;
DROP POLICY IF EXISTS "staff_manage_budgets" ON budgets;
DROP POLICY IF EXISTS "budgets_select_unified" ON budgets;
DROP POLICY IF EXISTS "budgets_insert_unified" ON budgets;
DROP POLICY IF EXISTS "budgets_update_unified" ON budgets;
DROP POLICY IF EXISTS "budgets_delete_unified" ON budgets;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية الميزانيات" ON budgets;

CREATE POLICY "budgets_select" ON budgets FOR SELECT TO authenticated
USING (is_financial_staff() OR is_heir());

CREATE POLICY "budgets_insert" ON budgets FOR INSERT TO authenticated
WITH CHECK (is_financial_staff());

CREATE POLICY "budgets_update" ON budgets FOR UPDATE TO authenticated
USING (is_financial_staff());

CREATE POLICY "budgets_delete" ON budgets FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- 7. fiscal_year_closings (7 → 4)
DROP POLICY IF EXISTS "Staff manage closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "staff_manage_closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "closings_select_unified" ON fiscal_year_closings;
DROP POLICY IF EXISTS "closings_insert_unified" ON fiscal_year_closings;
DROP POLICY IF EXISTS "closings_update_unified" ON fiscal_year_closings;
DROP POLICY IF EXISTS "closings_delete_unified" ON fiscal_year_closings;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية إقفالات الس" ON fiscal_year_closings;

CREATE POLICY "closings_select" ON fiscal_year_closings FOR SELECT TO authenticated
USING (has_full_read_access());

CREATE POLICY "closings_insert" ON fiscal_year_closings FOR INSERT TO authenticated
WITH CHECK (is_admin_or_nazer());

CREATE POLICY "closings_update" ON fiscal_year_closings FOR UPDATE TO authenticated
USING (is_admin_or_nazer());

CREATE POLICY "closings_delete" ON fiscal_year_closings FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- 8. bank_transactions (7 → 4)
DROP POLICY IF EXISTS "Staff manage bank transactions" ON bank_transactions;
DROP POLICY IF EXISTS "staff_manage_bank_transactions" ON bank_transactions;
DROP POLICY IF EXISTS "bank_transactions_select_unified" ON bank_transactions;
DROP POLICY IF EXISTS "bank_transactions_insert_unified" ON bank_transactions;
DROP POLICY IF EXISTS "bank_transactions_update_unified" ON bank_transactions;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية المعاملات" ON bank_transactions;
DROP POLICY IF EXISTS "المحاسبون يمكنهم إدارة المعاملات" ON bank_transactions;

CREATE POLICY "bank_txn_select" ON bank_transactions FOR SELECT TO authenticated
USING (is_financial_staff() OR is_heir());

CREATE POLICY "bank_txn_insert" ON bank_transactions FOR INSERT TO authenticated
WITH CHECK (is_financial_staff());

CREATE POLICY "bank_txn_update" ON bank_transactions FOR UPDATE TO authenticated
USING (is_financial_staff());

CREATE POLICY "bank_txn_delete" ON bank_transactions FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- 9. documents (6 → 4)
DROP POLICY IF EXISTS "Staff manage documents" ON documents;
DROP POLICY IF EXISTS "staff_manage_documents" ON documents;
DROP POLICY IF EXISTS "documents_select_unified" ON documents;
DROP POLICY IF EXISTS "documents_insert_unified" ON documents;
DROP POLICY IF EXISTS "documents_update_unified" ON documents;
DROP POLICY IF EXISTS "documents_delete_unified" ON documents;

CREATE POLICY "documents_select" ON documents FOR SELECT TO authenticated
USING (has_full_read_access());

CREATE POLICY "documents_insert" ON documents FOR INSERT TO authenticated
WITH CHECK (is_staff_only());

CREATE POLICY "documents_update" ON documents FOR UPDATE TO authenticated
USING (is_staff_only());

CREATE POLICY "documents_delete" ON documents FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- 10. funds (6 → 4)
DROP POLICY IF EXISTS "Staff manage funds" ON funds;
DROP POLICY IF EXISTS "staff_manage_funds" ON funds;
DROP POLICY IF EXISTS "funds_select_unified" ON funds;
DROP POLICY IF EXISTS "funds_insert_unified" ON funds;
DROP POLICY IF EXISTS "funds_update_unified" ON funds;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية الصناديق" ON funds;

CREATE POLICY "funds_select" ON funds FOR SELECT TO authenticated
USING (is_financial_staff() OR is_heir());

CREATE POLICY "funds_insert" ON funds FOR INSERT TO authenticated
WITH CHECK (is_financial_staff());

CREATE POLICY "funds_update" ON funds FOR UPDATE TO authenticated
USING (is_financial_staff());

CREATE POLICY "funds_delete" ON funds FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- تحديث الإحصائيات
ANALYZE maintenance_requests;
ANALYZE emergency_aid_requests;
ANALYZE invoices;
ANALYZE annual_disclosures;
ANALYZE family_members;
ANALYZE budgets;
ANALYZE fiscal_year_closings;
ANALYZE bank_transactions;
ANALYZE documents;
ANALYZE funds;
