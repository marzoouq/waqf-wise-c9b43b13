
-- =====================================================
-- تنظيف السياسات المتبقية في journal_entry_lines
-- =====================================================

DROP POLICY IF EXISTS "Allow authenticated insert on journal_entry_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "Financial staff view journal lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "accountants_update_journal_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "allow_authenticated_insert_journal_entry_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "allow_authenticated_select_journal_entry_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_journal_lines" ON journal_entry_lines;
DROP POLICY IF EXISTS "staff_and_heirs_view_journal_lines" ON journal_entry_lines;

-- =====================================================
-- تنظيف السياسات المتبقية في support_tickets
-- =====================================================

DROP POLICY IF EXISTS "Staff manage tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users view own tickets v2" ON support_tickets;
DROP POLICY IF EXISTS "staff_view_all_tickets" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_delete_unified" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_insert_unified" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_owner_or_staff" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_select_unified" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_update_unified" ON support_tickets;
DROP POLICY IF EXISTS "user_create_tickets" ON support_tickets;
DROP POLICY IF EXISTS "user_view_own_tickets" ON support_tickets;
DROP POLICY IF EXISTS "المسؤولون يمكنهم تحديث التذاكر" ON support_tickets;
DROP POLICY IF EXISTS "المستخدمون يمكنهم إنشاء تذاكر" ON support_tickets;

-- تحديث الإحصائيات
ANALYZE journal_entry_lines;
ANALYZE support_tickets;
