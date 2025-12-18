
-- =====================================================
-- التنظيف النهائي للسياسات المتبقية
-- =====================================================

-- contact_messages (10 → 4)
DROP POLICY IF EXISTS "Anyone can insert contact messages" ON contact_messages;
DROP POLICY IF EXISTS "Authenticated users can update contact messages" ON contact_messages;
DROP POLICY IF EXISTS "anyone_can_insert_contact" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_staff_only" ON contact_messages;
DROP POLICY IF EXISTS "staff_only_view_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "staff_view_contact_messages" ON contact_messages;

-- fiscal_year_closings (8 → 4)
DROP POLICY IF EXISTS "Authorized staff can create fiscal year closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Beneficiaries and heirs can view fiscal year closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Heirs read only fiscal closings" ON fiscal_year_closings;
DROP POLICY IF EXISTS "Nazer and Accountant full access to fiscal closings" ON fiscal_year_closings;

-- funds (8 → 4)
DROP POLICY IF EXISTS "Allow authenticated read on funds" ON funds;
DROP POLICY IF EXISTS "Beneficiaries and staff can view funds" ON funds;
DROP POLICY IF EXISTS "financial_staff_update_funds" ON funds;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة معلومات ا" ON funds;

-- invoices (7 → 4)
DROP POLICY IF EXISTS "الأدوار المالية فقط يمكنها قراءة ا" ON invoices;
DROP POLICY IF EXISTS "المحاسبون والصرافون يمكنهم إضافة " ON invoices;
DROP POLICY IF EXISTS "المحاسبون والصرافون يمكنهم تحديث " ON invoices;

-- maintenance_requests (10 → 4)
DROP POLICY IF EXISTS "Admins can manage maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "Authorized staff can create maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "Authorized staff can view all maintenance" ON maintenance_requests;
DROP POLICY IF EXISTS "staff_view_maintenance_requests" ON maintenance_requests;
DROP POLICY IF EXISTS "المستفيدون من الفئة الأولى يمكنهم " ON maintenance_requests;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة طلبات الص" ON maintenance_requests;

-- tasks (12 → 4)
DROP POLICY IF EXISTS "Admins and assigned users can update tasks" ON tasks;
DROP POLICY IF EXISTS "Allow authenticated insert on tasks" ON tasks;
DROP POLICY IF EXISTS "Only admins can delete tasks" ON tasks;
DROP POLICY IF EXISTS "Staff can create tasks" ON tasks;
DROP POLICY IF EXISTS "Staff can view all tasks" ON tasks;
DROP POLICY IF EXISTS "Staff can view tasks" ON tasks;
DROP POLICY IF EXISTS "staff_only_view_tasks" ON tasks;
DROP POLICY IF EXISTS "users_manage_own_tasks" ON tasks;

-- تحديث الإحصائيات
ANALYZE contact_messages;
ANALYZE fiscal_year_closings;
ANALYZE funds;
ANALYZE invoices;
ANALYZE maintenance_requests;
ANALYZE tasks;
