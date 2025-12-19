
-- ====================================
-- المرحلة الرابعة: Triggers + Indexes
-- ====================================

-- 1. Trigger تحديث أرصدة الحسابات
CREATE OR REPLACE FUNCTION public.update_account_balance_on_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_account_id UUID;
  v_new_balance NUMERIC;
BEGIN
  IF TG_OP = 'DELETE' THEN v_account_id := OLD.account_id;
  ELSE v_account_id := NEW.account_id; END IF;
  
  SELECT COALESCE(SUM(
    CASE WHEN a.account_nature IN ('debit', 'مدين') THEN jel.debit_amount - jel.credit_amount
    ELSE jel.credit_amount - jel.debit_amount END
  ), 0) INTO v_new_balance
  FROM journal_entry_lines jel
  JOIN journal_entries je ON je.id = jel.journal_entry_id
  JOIN accounts a ON a.id = jel.account_id
  WHERE jel.account_id = v_account_id AND je.status = 'posted';
  
  UPDATE accounts SET current_balance = v_new_balance, updated_at = NOW() WHERE id = v_account_id;
  
  IF TG_OP = 'UPDATE' AND OLD.account_id IS DISTINCT FROM NEW.account_id THEN
    SELECT COALESCE(SUM(
      CASE WHEN a.account_nature IN ('debit', 'مدين') THEN jel.debit_amount - jel.credit_amount
      ELSE jel.credit_amount - jel.debit_amount END
    ), 0) INTO v_new_balance
    FROM journal_entry_lines jel
    JOIN journal_entries je ON je.id = jel.journal_entry_id
    JOIN accounts a ON a.id = jel.account_id
    WHERE jel.account_id = OLD.account_id AND je.status = 'posted';
    UPDATE accounts SET current_balance = v_new_balance, updated_at = NOW() WHERE id = OLD.account_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_update_account_balance ON journal_entry_lines;
CREATE TRIGGER trg_update_account_balance
  AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
  FOR EACH ROW EXECUTE FUNCTION update_account_balance_on_entry();

-- 2. Trigger عند تغيير حالة القيد
CREATE OR REPLACE FUNCTION public.update_balances_on_entry_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) AND (OLD.status = 'posted' OR NEW.status = 'posted') THEN
    UPDATE accounts a SET current_balance = (
      SELECT COALESCE(SUM(
        CASE WHEN acc.account_nature IN ('debit', 'مدين') THEN jel.debit_amount - jel.credit_amount
        ELSE jel.credit_amount - jel.debit_amount END
      ), 0)
      FROM journal_entry_lines jel
      JOIN journal_entries je ON je.id = jel.journal_entry_id
      JOIN accounts acc ON acc.id = jel.account_id
      WHERE jel.account_id = a.id AND je.status = 'posted'
    ), updated_at = NOW()
    WHERE a.id IN (SELECT account_id FROM journal_entry_lines WHERE journal_entry_id = NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS trg_update_balances_on_status ON journal_entries;
CREATE TRIGGER trg_update_balances_on_status
  AFTER UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_balances_on_entry_status_change();

-- 3. Indexes للأداء

-- Journal entries & lines
CREATE INDEX IF NOT EXISTS idx_je_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_je_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_je_fiscal ON journal_entries(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_jel_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_jel_je ON journal_entry_lines(journal_entry_id);

-- Accounts
CREATE INDEX IF NOT EXISTS idx_acc_parent ON accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_acc_type ON accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_acc_code ON accounts(code);
CREATE INDEX IF NOT EXISTS idx_acc_active ON accounts(is_active);

-- Beneficiaries
CREATE INDEX IF NOT EXISTS idx_ben_status ON beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_ben_category ON beneficiaries(category);
CREATE INDEX IF NOT EXISTS idx_ben_national_id ON beneficiaries(national_id);
CREATE INDEX IF NOT EXISTS idx_ben_family ON beneficiaries(family_id);

-- Distributions
CREATE INDEX IF NOT EXISTS idx_dist_status ON distributions(status);
CREATE INDEX IF NOT EXISTS idx_dist_date ON distributions(distribution_date);

-- Distribution details
CREATE INDEX IF NOT EXISTS idx_dd_dist ON distribution_details(distribution_id);
CREATE INDEX IF NOT EXISTS idx_dd_benef ON distribution_details(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_dd_payment_status ON distribution_details(payment_status);

-- Payment vouchers (no payment_date column)
CREATE INDEX IF NOT EXISTS idx_pv_status ON payment_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_pv_benef ON payment_vouchers(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_pv_created ON payment_vouchers(created_at);

-- Bank transactions
CREATE INDEX IF NOT EXISTS idx_bt_statement ON bank_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_bt_date ON bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bt_matched ON bank_transactions(is_matched);

-- Approval
CREATE INDEX IF NOT EXISTS idx_as_entity ON approval_status(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_asteps_status ON approval_steps(approval_status_id);
CREATE INDEX IF NOT EXISTS idx_ah_ref ON approval_history(reference_id, approval_type);

-- Invoices & contracts (invoice_date not issue_date)
CREATE INDEX IF NOT EXISTS idx_inv_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_inv_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_con_status ON contracts(status);
CREATE INDEX IF NOT EXISTS idx_con_property ON contracts(property_id);

-- Properties
CREATE INDEX IF NOT EXISTS idx_prop_type ON properties(type);
CREATE INDEX IF NOT EXISTS idx_prop_status ON properties(status);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_logs(created_at);

-- Beneficiary requests
CREATE INDEX IF NOT EXISTS idx_br_status ON beneficiary_requests(status);
CREATE INDEX IF NOT EXISTS idx_br_benef ON beneficiary_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_br_type ON beneficiary_requests(request_type_id);

-- Budget items
CREATE INDEX IF NOT EXISTS idx_bi_budget ON budget_items(budget_id);
CREATE INDEX IF NOT EXISTS idx_bi_account ON budget_items(account_id);

-- Messages
CREATE INDEX IF NOT EXISTS idx_msg_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_read ON messages(is_read);
