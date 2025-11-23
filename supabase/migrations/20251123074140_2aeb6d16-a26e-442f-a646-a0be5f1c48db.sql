-- Migration: إصلاح Security Views و Cascade Deletes
-- المرحلة 3 + 4: تطبيق security_invoker على جميع Views وإضافة CASCADE للعلاقات

-- ======================================
-- المرحلة 3: تطبيق security_invoker على Views
-- ======================================

-- تطبيق security_invoker على جميع Views الموجودة
ALTER VIEW IF EXISTS beneficiary_statistics SET (security_invoker = true);
ALTER VIEW IF EXISTS distribution_statistics SET (security_invoker = true);
ALTER VIEW IF EXISTS messages_with_users SET (security_invoker = true);
ALTER VIEW IF EXISTS payment_vouchers_with_details SET (security_invoker = true);
ALTER VIEW IF EXISTS users_with_roles SET (security_invoker = true);

-- ======================================
-- المرحلة 4: إضافة Cascade Deletes
-- ======================================

-- 1. loan_installments -> loans
ALTER TABLE loan_installments
DROP CONSTRAINT IF EXISTS loan_installments_loan_id_fkey,
ADD CONSTRAINT loan_installments_loan_id_fkey 
  FOREIGN KEY (loan_id) 
  REFERENCES loans(id) 
  ON DELETE CASCADE;

-- 2. distribution_details -> distributions
ALTER TABLE distribution_details
DROP CONSTRAINT IF EXISTS distribution_details_distribution_id_fkey,
ADD CONSTRAINT distribution_details_distribution_id_fkey 
  FOREIGN KEY (distribution_id) 
  REFERENCES distributions(id) 
  ON DELETE CASCADE;

-- 3. invoice_lines -> invoices
ALTER TABLE invoice_lines
DROP CONSTRAINT IF EXISTS invoice_lines_invoice_id_fkey,
ADD CONSTRAINT invoice_lines_invoice_id_fkey 
  FOREIGN KEY (invoice_id) 
  REFERENCES invoices(id) 
  ON DELETE CASCADE;

-- 4. علاقات إضافية تحتاج CASCADE
-- loan_payments -> loans
ALTER TABLE loan_payments
DROP CONSTRAINT IF EXISTS loan_payments_loan_id_fkey,
ADD CONSTRAINT loan_payments_loan_id_fkey 
  FOREIGN KEY (loan_id) 
  REFERENCES loans(id) 
  ON DELETE CASCADE;

-- rental_payments -> contracts
ALTER TABLE rental_payments
DROP CONSTRAINT IF EXISTS rental_payments_contract_id_fkey,
ADD CONSTRAINT rental_payments_contract_id_fkey 
  FOREIGN KEY (contract_id) 
  REFERENCES contracts(id) 
  ON DELETE CASCADE;

-- distribution_approvals -> distributions
ALTER TABLE distribution_approvals
DROP CONSTRAINT IF EXISTS distribution_approvals_distribution_id_fkey,
ADD CONSTRAINT distribution_approvals_distribution_id_fkey 
  FOREIGN KEY (distribution_id) 
  REFERENCES distributions(id) 
  ON DELETE CASCADE;

-- loan_approvals -> loans
ALTER TABLE loan_approvals
DROP CONSTRAINT IF EXISTS loan_approvals_loan_id_fkey,
ADD CONSTRAINT loan_approvals_loan_id_fkey 
  FOREIGN KEY (loan_id) 
  REFERENCES loans(id) 
  ON DELETE CASCADE;

-- beneficiary_attachments -> beneficiaries
ALTER TABLE beneficiary_attachments
DROP CONSTRAINT IF EXISTS beneficiary_attachments_beneficiary_id_fkey,
ADD CONSTRAINT beneficiary_attachments_beneficiary_id_fkey 
  FOREIGN KEY (beneficiary_id) 
  REFERENCES beneficiaries(id) 
  ON DELETE CASCADE;

-- beneficiary_activity_log -> beneficiaries
ALTER TABLE beneficiary_activity_log
DROP CONSTRAINT IF EXISTS beneficiary_activity_log_beneficiary_id_fkey,
ADD CONSTRAINT beneficiary_activity_log_beneficiary_id_fkey 
  FOREIGN KEY (beneficiary_id) 
  REFERENCES beneficiaries(id) 
  ON DELETE CASCADE;

-- beneficiary_requests -> beneficiaries
ALTER TABLE beneficiary_requests
DROP CONSTRAINT IF EXISTS beneficiary_requests_beneficiary_id_fkey,
ADD CONSTRAINT beneficiary_requests_beneficiary_id_fkey 
  FOREIGN KEY (beneficiary_id) 
  REFERENCES beneficiaries(id) 
  ON DELETE CASCADE;

-- contract_attachments -> contracts
ALTER TABLE contract_attachments
DROP CONSTRAINT IF EXISTS contract_attachments_contract_id_fkey,
ADD CONSTRAINT contract_attachments_contract_id_fkey 
  FOREIGN KEY (contract_id) 
  REFERENCES contracts(id) 
  ON DELETE CASCADE;

-- journal_entry_lines -> journal_entries
ALTER TABLE journal_entry_lines
DROP CONSTRAINT IF EXISTS journal_entry_lines_journal_entry_id_fkey,
ADD CONSTRAINT journal_entry_lines_journal_entry_id_fkey 
  FOREIGN KEY (journal_entry_id) 
  REFERENCES journal_entries(id) 
  ON DELETE CASCADE;