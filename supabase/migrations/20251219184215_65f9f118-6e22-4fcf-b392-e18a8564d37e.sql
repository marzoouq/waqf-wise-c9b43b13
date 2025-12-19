-- =====================================================
-- المرحلة 2: إضافة Foreign Keys الحرجة (الجداول الموجودة فقط)
-- =====================================================

-- 1. journal_entry_lines -> accounts (account_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_jel_account'
  ) THEN
    ALTER TABLE journal_entry_lines 
    ADD CONSTRAINT fk_jel_account 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 2. journal_entry_lines -> journal_entries (journal_entry_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_jel_journal_entry'
  ) THEN
    ALTER TABLE journal_entry_lines 
    ADD CONSTRAINT fk_jel_journal_entry 
    FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. bank_transactions -> bank_statements (statement_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_bank_txn_statement'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_transactions_statement_id_fkey'
  ) THEN
    ALTER TABLE bank_transactions 
    ADD CONSTRAINT fk_bank_txn_statement 
    FOREIGN KEY (statement_id) REFERENCES bank_statements(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. distribution_details -> distributions (distribution_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_dist_details_distribution'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'distribution_details_distribution_id_fkey'
  ) THEN
    ALTER TABLE distribution_details 
    ADD CONSTRAINT fk_dist_details_distribution 
    FOREIGN KEY (distribution_id) REFERENCES distributions(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 5. distribution_details -> beneficiaries (beneficiary_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_dist_details_beneficiary'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'distribution_details_beneficiary_id_fkey'
  ) THEN
    ALTER TABLE distribution_details 
    ADD CONSTRAINT fk_dist_details_beneficiary 
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 6. payment_vouchers -> distributions (distribution_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_payment_vouchers_distribution'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_vouchers_distribution_id_fkey'
  ) THEN
    ALTER TABLE payment_vouchers 
    ADD CONSTRAINT fk_payment_vouchers_distribution 
    FOREIGN KEY (distribution_id) REFERENCES distributions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 7. payment_vouchers -> beneficiaries (beneficiary_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_payment_vouchers_beneficiary'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payment_vouchers_beneficiary_id_fkey'
  ) THEN
    ALTER TABLE payment_vouchers 
    ADD CONSTRAINT fk_payment_vouchers_beneficiary 
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE RESTRICT;
  END IF;
END $$;

-- 8. accounts -> accounts (parent_id) للتسلسل الهرمي
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_accounts_parent'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'accounts_parent_id_fkey'
  ) THEN
    ALTER TABLE accounts 
    ADD CONSTRAINT fk_accounts_parent 
    FOREIGN KEY (parent_id) REFERENCES accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 9. bank_accounts -> accounts (account_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_bank_accounts_account'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_accounts_account_id_fkey'
  ) THEN
    ALTER TABLE bank_accounts 
    ADD CONSTRAINT fk_bank_accounts_account 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 10. beneficiary_activity_log -> beneficiaries (beneficiary_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_activity_log_beneficiary'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'beneficiary_activity_log_beneficiary_id_fkey'
  ) THEN
    ALTER TABLE beneficiary_activity_log 
    ADD CONSTRAINT fk_activity_log_beneficiary 
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 11. beneficiary_attachments -> beneficiaries (beneficiary_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_attachments_beneficiary'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'beneficiary_attachments_beneficiary_id_fkey'
  ) THEN
    ALTER TABLE beneficiary_attachments 
    ADD CONSTRAINT fk_attachments_beneficiary 
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 12. beneficiary_requests -> beneficiaries (beneficiary_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_requests_beneficiary'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'beneficiary_requests_beneficiary_id_fkey'
  ) THEN
    ALTER TABLE beneficiary_requests 
    ADD CONSTRAINT fk_requests_beneficiary 
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 13. beneficiary_sessions -> beneficiaries (beneficiary_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_sessions_beneficiary'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'beneficiary_sessions_beneficiary_id_fkey'
  ) THEN
    ALTER TABLE beneficiary_sessions 
    ADD CONSTRAINT fk_sessions_beneficiary 
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 14. beneficiary_tags -> beneficiaries (beneficiary_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_tags_beneficiary'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'beneficiary_tags_beneficiary_id_fkey'
  ) THEN
    ALTER TABLE beneficiary_tags 
    ADD CONSTRAINT fk_tags_beneficiary 
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 15. beneficiaries -> beneficiaries (parent_beneficiary_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_beneficiaries_parent'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'beneficiaries_parent_beneficiary_id_fkey'
  ) THEN
    ALTER TABLE beneficiaries 
    ADD CONSTRAINT fk_beneficiaries_parent 
    FOREIGN KEY (parent_beneficiary_id) REFERENCES beneficiaries(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 16. beneficiaries -> families (family_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_beneficiaries_family'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'beneficiaries_family_id_fkey'
  ) THEN
    ALTER TABLE beneficiaries 
    ADD CONSTRAINT fk_beneficiaries_family 
    FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 17. bank_transfer_details -> beneficiaries (beneficiary_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_transfer_details_beneficiary'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_transfer_details_beneficiary_id_fkey'
  ) THEN
    ALTER TABLE bank_transfer_details 
    ADD CONSTRAINT fk_transfer_details_beneficiary 
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE SET NULL;
  END IF;
END $$;

-- 18. bank_transfer_details -> bank_transfer_files (transfer_file_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_transfer_details_file'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'bank_transfer_details_transfer_file_id_fkey'
  ) THEN
    ALTER TABLE bank_transfer_details 
    ADD CONSTRAINT fk_transfer_details_file 
    FOREIGN KEY (transfer_file_id) REFERENCES bank_transfer_files(id) ON DELETE CASCADE;
  END IF;
END $$;