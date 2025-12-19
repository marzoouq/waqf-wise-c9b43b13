-- =====================================================
-- المرحلة 3: إضافة Foreign Keys المتبقية (الأعمدة الموجودة فقط)
-- =====================================================

-- 1. إضافة FK لـ invoice_lines -> invoices (invoice_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoice_lines_invoice'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoice_lines_invoice_id_fkey'
  ) THEN
    ALTER TABLE invoice_lines 
    ADD CONSTRAINT fk_invoice_lines_invoice 
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. إضافة FK لـ invoice_lines -> accounts (account_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoice_lines_account'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoice_lines_account_id_fkey'
  ) THEN
    ALTER TABLE invoice_lines 
    ADD CONSTRAINT fk_invoice_lines_account 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 3. إضافة FK لـ contracts -> properties (property_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_contracts_property'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'contracts_property_id_fkey'
  ) THEN
    ALTER TABLE contracts 
    ADD CONSTRAINT fk_contracts_property 
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 4. إضافة FK لـ invoices -> journal_entries (journal_entry_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_invoices_journal_entry'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoices_journal_entry_id_fkey'
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT fk_invoices_journal_entry 
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 5. إضافة FK لـ approval_steps -> approval_status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_approval_steps_status'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'approval_steps_approval_status_id_fkey'
  ) THEN
    ALTER TABLE approval_steps 
    ADD CONSTRAINT fk_approval_steps_status 
    FOREIGN KEY (approval_status_id) REFERENCES approval_status(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 6. إضافة FK لـ approval_status -> approval_workflows
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_approval_status_workflow'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'approval_status_workflow_id_fkey'
  ) THEN
    ALTER TABLE approval_status 
    ADD CONSTRAINT fk_approval_status_workflow 
    FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. إضافة FK لـ auto_journal_log -> auto_journal_templates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_auto_journal_log_template'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'auto_journal_log_template_id_fkey'
  ) THEN
    ALTER TABLE auto_journal_log 
    ADD CONSTRAINT fk_auto_journal_log_template 
    FOREIGN KEY (template_id) REFERENCES auto_journal_templates(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 8. إضافة FK لـ auto_journal_log -> journal_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_auto_journal_log_entry'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'auto_journal_log_journal_entry_id_fkey'
  ) THEN
    ALTER TABLE auto_journal_log 
    ADD CONSTRAINT fk_auto_journal_log_entry 
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 9. إضافة FK لـ bank_reconciliation_matches -> bank_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_bank_matches_transaction'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_reconciliation_matches_bank_transaction_id_fkey'
  ) THEN
    ALTER TABLE bank_reconciliation_matches 
    ADD CONSTRAINT fk_bank_matches_transaction 
    FOREIGN KEY (bank_transaction_id) REFERENCES bank_transactions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 10. إضافة FK لـ bank_reconciliation_matches -> journal_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_bank_matches_journal_entry'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_reconciliation_matches_journal_entry_id_fkey'
  ) THEN
    ALTER TABLE bank_reconciliation_matches 
    ADD CONSTRAINT fk_bank_matches_journal_entry 
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 11. إضافة FK لـ bank_transfer_files -> bank_accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_transfer_files_bank_account'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_transfer_files_bank_account_id_fkey'
  ) THEN
    ALTER TABLE bank_transfer_files 
    ADD CONSTRAINT fk_transfer_files_bank_account 
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 12. إضافة FK لـ bank_transfer_files -> distributions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_transfer_files_distribution'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_transfer_files_distribution_id_fkey'
  ) THEN
    ALTER TABLE bank_transfer_files 
    ADD CONSTRAINT fk_transfer_files_distribution 
    FOREIGN KEY (distribution_id) REFERENCES distributions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 13. إضافة FK لـ beneficiary_requests -> request_types
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_requests_type'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'beneficiary_requests_request_type_id_fkey'
  ) THEN
    ALTER TABLE beneficiary_requests 
    ADD CONSTRAINT fk_requests_type 
    FOREIGN KEY (request_type_id) REFERENCES request_types(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 14. إضافة FK لـ budget_items -> budgets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_budget_items_budget'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budget_items_budget_id_fkey'
  ) THEN
    ALTER TABLE budget_items 
    ADD CONSTRAINT fk_budget_items_budget 
    FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 15. إضافة FK لـ budget_items -> accounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_budget_items_account'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'budget_items_account_id_fkey'
  ) THEN
    ALTER TABLE budget_items 
    ADD CONSTRAINT fk_budget_items_account 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 16. إضافة FK لـ annual_disclosures -> fiscal_years
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_disclosures_fiscal_year'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'annual_disclosures_fiscal_year_id_fkey'
  ) THEN
    ALTER TABLE annual_disclosures 
    ADD CONSTRAINT fk_disclosures_fiscal_year 
    FOREIGN KEY (fiscal_year_id) REFERENCES fiscal_years(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 17. إضافة FK لـ bank_transactions -> journal_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_bank_txn_journal_entry'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_transactions_journal_entry_id_fkey'
  ) THEN
    ALTER TABLE bank_transactions 
    ADD CONSTRAINT fk_bank_txn_journal_entry 
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 18. إضافة FK لـ bank_transfer_details -> payment_vouchers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_transfer_details_voucher'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_transfer_details_payment_voucher_id_fkey'
  ) THEN
    ALTER TABLE bank_transfer_details 
    ADD CONSTRAINT fk_transfer_details_voucher 
    FOREIGN KEY (payment_voucher_id) REFERENCES payment_vouchers(id) ON DELETE CASCADE;
  END IF;
END $$;