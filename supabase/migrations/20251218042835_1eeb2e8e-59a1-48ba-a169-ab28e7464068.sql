
-- =====================================================
-- تنظيف شامل للسياسات المتبقية المكررة
-- =====================================================

-- annual_disclosures
DROP POLICY IF EXISTS "Heirs can view published disclosures" ON annual_disclosures;
DROP POLICY IF EXISTS "Staff can delete disclosures" ON annual_disclosures;
DROP POLICY IF EXISTS "Staff full access to disclosures" ON annual_disclosures;
DROP POLICY IF EXISTS "disclosures_view_policy" ON annual_disclosures;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_disclosures" ON annual_disclosures;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_annual_disclosures" ON annual_disclosures;
DROP POLICY IF EXISTS "الناظر والمشرف يمكنهم إنشاء إفصاح" ON annual_disclosures;
DROP POLICY IF EXISTS "الناظر والمشرف يمكنهم تعديل الإفص" ON annual_disclosures;

-- bank_transactions
DROP POLICY IF EXISTS "Allow authenticated insert on bank_transactions" ON bank_transactions;
DROP POLICY IF EXISTS "financial_staff_can_update_bank_transactions" ON bank_transactions;
DROP POLICY IF EXISTS "financial_staff_manage_transactions" ON bank_transactions;
DROP POLICY IF EXISTS "financial_staff_view_transactions" ON bank_transactions;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_bank_transactions" ON bank_transactions;
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON bank_transactions;
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم " ON bank_transactions;

-- budgets
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_budgets" ON budgets;
DROP POLICY IF EXISTS "المستفيدون من الدرجة الأولى يمكنه" ON budgets;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة الميزانيا" ON budgets;

-- documents
DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_documents" ON documents;
DROP POLICY IF EXISTS "waqf_heirs_can_view_documents" ON documents;
DROP POLICY IF EXISTS "الأرشيفيون والمسؤولون يمكنهم إضاف" ON documents;
DROP POLICY IF EXISTS "الأرشيفيون والمسؤولون يمكنهم تحدي" ON documents;
DROP POLICY IF EXISTS "الأرشيفيون والمسؤولون يمكنهم رؤية" ON documents;

-- emergency_aid_requests
DROP POLICY IF EXISTS "emergency_aid_delete_unified" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_insert_unified" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_owner_or_staff" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_select_unified" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_staff_all" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_update_unified" ON emergency_aid_requests;
DROP POLICY IF EXISTS "enable_insert_for_all" ON emergency_aid_requests;
DROP POLICY IF EXISTS "staff_view_emergency_aid" ON emergency_aid_requests;

-- family_members
DROP POLICY IF EXISTS "Admin can delete family members" ON family_members;
DROP POLICY IF EXISTS "Admin can insert family members" ON family_members;
DROP POLICY IF EXISTS "Admin can update family members" ON family_members;
DROP POLICY IF EXISTS "Admins can delete family members" ON family_members;
DROP POLICY IF EXISTS "Admins can insert family members" ON family_members;
DROP POLICY IF EXISTS "Admins can update family members" ON family_members;
DROP POLICY IF EXISTS "Authenticated users can view family members" ON family_members;
DROP POLICY IF EXISTS "Staff can view all family members" ON family_members;

-- fiscal_year_closings
DROP POLICY IF EXISTS "Admin and nazer can update fiscal year closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Admin can delete fiscal year closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Admins and nazer can insert fiscal year closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Staff can view all fiscal year closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_fiscal_year_closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_fiscal_year_closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "waqf_heir_view_fiscal_year_closings" ON fiscal_year_closings;

-- maintenance_requests
DROP POLICY IF EXISTS "Allow authenticated insert on maintenance_requests" ON maintenance_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON maintenance_requests;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_maintenance_requests" ON maintenance_requests;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_maintenance_requests" ON maintenance_requests;
DROP POLICY IF EXISTS "staff_manage_maintenance_requests" ON maintenance_requests;
DROP POLICY IF EXISTS "waqf_heir_view_maintenance_requests" ON maintenance_requests;
DROP POLICY IF EXISTS "المستفيدون يمكنهم رؤية طلبات الصي" ON maintenance_requests;

-- funds
DROP POLICY IF EXISTS "Allow authenticated insert on funds" ON funds;
DROP POLICY IF EXISTS "Staff manage funds" ON funds;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_funds" ON funds;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_funds" ON funds;
DROP POLICY IF EXISTS "staff_view_funds" ON funds;
DROP POLICY IF EXISTS "waqf_heir_view_funds" ON funds;

-- invoices
DROP POLICY IF EXISTS "Allow authenticated insert on invoices" ON invoices;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_invoices" ON invoices;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_invoices" ON invoices;
DROP POLICY IF EXISTS "staff_manage_invoices" ON invoices;

-- tasks
DROP POLICY IF EXISTS "Staff manage tasks" ON tasks;
DROP POLICY IF EXISTS "staff_manage_tasks" ON tasks;
DROP POLICY IF EXISTS "tasks_select_unified" ON tasks;
DROP POLICY IF EXISTS "tasks_insert_unified" ON tasks;
DROP POLICY IF EXISTS "tasks_update_unified" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_unified" ON tasks;
DROP POLICY IF EXISTS "الموظفون يمكنهم إدارة المهام" ON tasks;
DROP POLICY IF EXISTS "المستخدمون يمكنهم رؤية مهامهم" ON tasks;

CREATE POLICY "tasks_select" ON tasks FOR SELECT TO authenticated
USING (assigned_to = auth.uid() OR created_by = auth.uid() OR is_staff_only());

CREATE POLICY "tasks_insert" ON tasks FOR INSERT TO authenticated
WITH CHECK (is_staff_only());

CREATE POLICY "tasks_update" ON tasks FOR UPDATE TO authenticated
USING (assigned_to = auth.uid() OR is_staff_only());

CREATE POLICY "tasks_delete" ON tasks FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- contact_messages
DROP POLICY IF EXISTS "Staff manage contact messages" ON contact_messages;
DROP POLICY IF EXISTS "staff_manage_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_select_unified" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_insert_unified" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_update_unified" ON contact_messages;
DROP POLICY IF EXISTS "المستخدمون يمكنهم إرسال رسائل" ON contact_messages;
DROP POLICY IF EXISTS "الموظفون يمكنهم رؤية الرسائل" ON contact_messages;

CREATE POLICY "contact_select" ON contact_messages FOR SELECT TO authenticated
USING (is_staff_only());

CREATE POLICY "contact_insert" ON contact_messages FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "contact_update" ON contact_messages FOR UPDATE TO authenticated
USING (is_staff_only());

CREATE POLICY "contact_delete" ON contact_messages FOR DELETE TO authenticated
USING (is_admin_or_nazer());

-- تحديث الإحصائيات
ANALYZE annual_disclosures;
ANALYZE bank_transactions;
ANALYZE budgets;
ANALYZE documents;
ANALYZE emergency_aid_requests;
ANALYZE family_members;
ANALYZE fiscal_year_closings;
ANALYZE maintenance_requests;
ANALYZE funds;
ANALYZE invoices;
ANALYZE tasks;
ANALYZE contact_messages;
