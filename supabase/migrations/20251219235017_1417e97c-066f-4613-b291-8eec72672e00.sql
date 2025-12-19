-- حذف سياسات RLS المكررة (19 سياسة)
-- ================================================

-- tenant_ledger (4 سياسات مكررة - الأخطر)
DROP POLICY IF EXISTS "financial_tenant_ledger_v2" ON tenant_ledger;
DROP POLICY IF EXISTS "tenant_ledger_staff_manage" ON tenant_ledger;
DROP POLICY IF EXISTS "tenant_ledger_view" ON tenant_ledger;

-- bank_reconciliation_matches (2 سياسات مكررة)
DROP POLICY IF EXISTS "staff_select_bank_reconciliation_matches" ON bank_reconciliation_matches;
DROP POLICY IF EXISTS "staff_update_bank_reconciliation_matches" ON bank_reconciliation_matches;

-- bank_statements (1 سياسة مكررة)
DROP POLICY IF EXISTS "staff_update_bank_statements" ON bank_statements;

-- contracts (1 سياسة مكررة)
DROP POLICY IF EXISTS "contracts_view" ON contracts;

-- families (1 سياسة مكررة)
DROP POLICY IF EXISTS "families_view" ON families;

-- fiscal_year_closings (1 سياسة مكررة)
DROP POLICY IF EXISTS "heirs_read_fiscal_closings" ON fiscal_year_closings;

-- fiscal_years (1 سياسة مكررة)
DROP POLICY IF EXISTS "fiscal_years_view" ON fiscal_years;

-- historical_invoices (1 سياسة مكررة)
DROP POLICY IF EXISTS "admin_nazer_manage_historical_invoices" ON historical_invoices;

-- maintenance_requests (1 سياسة مكررة)
DROP POLICY IF EXISTS "staff_manage_maintenance_requests" ON maintenance_requests;

-- opening_balances (1 سياسة مكررة)
DROP POLICY IF EXISTS "financial_opening_balances" ON opening_balances;

-- pos_transactions (1 سياسة مكررة)
DROP POLICY IF EXISTS "financial_pos_transactions" ON pos_transactions;

-- rental_payments (1 سياسة مكررة)
DROP POLICY IF EXISTS "rental_payments_staff_manage" ON rental_payments;

-- support_tickets (1 سياسة مكررة)
DROP POLICY IF EXISTS "support_tickets_staff_manage" ON support_tickets;

-- waqf_distribution_settings (1 سياسة مكررة)
DROP POLICY IF EXISTS "admin_nazer_manage_settings" ON waqf_distribution_settings;

-- zatca_submission_log (1 سياسة مكررة)
DROP POLICY IF EXISTS "financial_zatca_log" ON zatca_submission_log;