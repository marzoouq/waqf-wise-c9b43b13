-- ============================================
-- 1️⃣ حذف الفهرس المكرر
-- ============================================
DROP INDEX IF EXISTS idx_funds_active_lookup;

-- ============================================
-- 2️⃣ تنظيف الجداول الحرجة
-- ============================================

-- حذف سجلات distribution_details الفارغة
DELETE FROM public.distribution_details WHERE distribution_id IS NULL;

-- حذف سجلات protected_policies_log القديمة
DELETE FROM public.protected_policies_log WHERE created_at < NOW() - INTERVAL '30 days';

-- حذف سجلات disclosure_documents الفارغة
DELETE FROM public.disclosure_documents WHERE file_path IS NULL;

-- حذف loan_installments بدون قروض مرتبطة
DELETE FROM public.loan_installments WHERE loan_id IS NULL;

-- حذف bank_accounts غير النشطة والفارغة
DELETE FROM public.bank_accounts WHERE is_active = false AND current_balance = 0;

-- حذف approvals بدون قيود مرتبطة
DELETE FROM public.approvals WHERE journal_entry_id IS NULL;

-- حذف distribution_approvals بدون توزيعات
DELETE FROM public.distribution_approvals WHERE distribution_id IS NULL;

-- حذف bank_transactions بدون كشوفات
DELETE FROM public.bank_transactions WHERE statement_id IS NULL;

-- حذف maintenance_schedules القديمة
DELETE FROM public.maintenance_schedules WHERE created_at < NOW() - INTERVAL '90 days';

-- حذف budgets الفارغة
DELETE FROM public.budgets WHERE actual_amount = 0 OR actual_amount IS NULL;

-- حذف invoice_lines بدون فواتير
DELETE FROM public.invoice_lines WHERE invoice_id IS NULL;

-- حذف bank_statements الفارغة
DELETE FROM public.bank_statements WHERE opening_balance = 0 AND closing_balance = 0;

-- ============================================
-- 3️⃣ تحديث الإحصائيات للجداول الرئيسية
-- ============================================
ANALYZE public.user_roles;
ANALYZE public.beneficiaries;
ANALYZE public.profiles;
ANALYZE public.accounts;
ANALYZE public.journal_entries;
ANALYZE public.distributions;
ANALYZE public.properties;
ANALYZE public.funds;
ANALYZE public.families;