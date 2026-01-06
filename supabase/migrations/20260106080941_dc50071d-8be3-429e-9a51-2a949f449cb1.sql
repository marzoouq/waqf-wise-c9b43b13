-- ============================================
-- تنظيف الجداول ذات الصفوف الميتة 100%
-- (جميعها بـ CASCADE لتجنب مشاكل المفاتيح الأجنبية)
-- ============================================

-- 1️⃣ distribution_details - 0 حية، 42 ميتة
TRUNCATE TABLE public.distribution_details CASCADE;

-- 2️⃣ disclosure_documents - 0 حية، 15 ميتة  
TRUNCATE TABLE public.disclosure_documents CASCADE;

-- 3️⃣ protected_policies_log - 0 حية، 16 ميتة
TRUNCATE TABLE public.protected_policies_log CASCADE;

-- 4️⃣ loan_installments - 0 حية، 8 ميتة
TRUNCATE TABLE public.loan_installments CASCADE;

-- 5️⃣ bank_accounts - 0 حية، 6 ميتة
TRUNCATE TABLE public.bank_accounts CASCADE;

-- 6️⃣ approvals - 0 حية، 6 ميتة
TRUNCATE TABLE public.approvals CASCADE;

-- 7️⃣ distribution_approvals - 0 حية، 5 ميتة
TRUNCATE TABLE public.distribution_approvals CASCADE;

-- 8️⃣ bank_transactions - 0 حية، 5 ميتة
TRUNCATE TABLE public.bank_transactions CASCADE;

-- 9️⃣ maintenance_schedules - 0 حية، 4 ميتة
TRUNCATE TABLE public.maintenance_schedules CASCADE;

-- 🔟 budgets - 0 حية، 4 ميتة
TRUNCATE TABLE public.budgets CASCADE;

-- 1️⃣1️⃣ invoice_lines - 0 حية، 3 ميتة
TRUNCATE TABLE public.invoice_lines CASCADE;

-- 1️⃣2️⃣ bank_statements - 0 حية، 2 ميتة
TRUNCATE TABLE public.bank_statements CASCADE;

-- 1️⃣3️⃣ governance_decisions - 0 حية، 1 ميتة
TRUNCATE TABLE public.governance_decisions CASCADE;

-- ============================================
-- تحديث الإحصائيات بعد التنظيف
-- ============================================
ANALYZE public.distribution_details;
ANALYZE public.disclosure_documents;
ANALYZE public.protected_policies_log;
ANALYZE public.loan_installments;
ANALYZE public.bank_accounts;
ANALYZE public.approvals;
ANALYZE public.distribution_approvals;
ANALYZE public.bank_transactions;
ANALYZE public.maintenance_schedules;
ANALYZE public.budgets;
ANALYZE public.invoice_lines;
ANALYZE public.bank_statements;
ANALYZE public.governance_decisions;