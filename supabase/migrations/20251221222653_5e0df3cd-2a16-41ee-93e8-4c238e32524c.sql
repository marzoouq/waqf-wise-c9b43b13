-- حذف الفهارس المكررة (نفس الأعمدة موجودة في فهرس آخر)

-- 1. profiles: idx_profiles_user_id مكرر مع profiles_user_id_key
DROP INDEX IF EXISTS idx_profiles_user_id;

-- 2. families: idx_families_head_of_family_id مكرر مع idx_families_head_of_family
DROP INDEX IF EXISTS idx_families_head_of_family_id;

-- 3. contracts: idx_contracts_status مكرر مع idx_con_status
DROP INDEX IF EXISTS idx_contracts_status;

-- 4. contracts: idx_contracts_property_id مكرر مع idx_con_property
DROP INDEX IF EXISTS idx_contracts_property_id;

-- 5. journal_entry_lines: idx_journal_entry_lines_journal_entry_id مكرر مع idx_journal_entry_lines_entry
DROP INDEX IF EXISTS idx_journal_entry_lines_journal_entry_id;

-- 6. journal_entry_lines: idx_journal_entry_lines_account_id مكرر مع idx_journal_entry_lines_account
DROP INDEX IF EXISTS idx_journal_entry_lines_account_id;

-- 7. beneficiary_requests: idx_beneficiary_requests_submitted_at مكرر مع idx_requests_submitted
DROP INDEX IF EXISTS idx_beneficiary_requests_submitted_at;

-- 8. audit_logs: idx_audit_date أصغر حجماً - نحتفظ به ونحذف idx_audit_logs_created
DROP INDEX IF EXISTS idx_audit_logs_created;

-- 9. payment_vouchers: idx_pv_created أصغر - نحتفظ به ونحذف idx_payment_vouchers_created_at
DROP INDEX IF EXISTS idx_payment_vouchers_created_at;

-- 10. distributions: idx_dist_date أصغر - نحتفظ به ونحذف idx_distributions_distribution_date
DROP INDEX IF EXISTS idx_distributions_distribution_date;

-- 11. invoices: idx_inv_date أصغر - نحتفظ به ونحذف idx_invoices_invoice_date
DROP INDEX IF EXISTS idx_invoices_invoice_date;

-- 12. system_alerts: نحذف الأكبر حجماً idx_system_alerts_created_at
DROP INDEX IF EXISTS idx_system_alerts_created_at;

-- 13. system_health_checks: نحذف الأكبر حجماً idx_system_health_checks_created_at
DROP INDEX IF EXISTS idx_system_health_checks_created_at;