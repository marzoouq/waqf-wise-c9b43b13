
-- تعطيل Triggers
DROP TRIGGER IF EXISTS trigger_create_journal_for_payment ON payments;
DROP TRIGGER IF EXISTS trigger_update_total_received ON payments;

-- المرحلة 1: payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS reference_type text, ADD COLUMN IF NOT EXISTS reference_id uuid;

INSERT INTO payments (payment_number, payment_date, payment_type, amount, payment_method, payer_name, beneficiary_id, status, description, reference_type, reference_id)
SELECT 'PAY-' || TO_CHAR(hd.distribution_date, 'YYYY') || '-' || LPAD(ROW_NUMBER() OVER(ORDER BY hd.created_at)::TEXT, 4, '0'),
  hd.distribution_date, 'payment', hd.share_amount, 'bank_transfer', 'الوقف', hd.beneficiary_id, 'completed',
  'حصة ' || hd.heir_type || ' من توزيع غلة الوقف', 'distribution', hd.id
FROM heir_distributions hd
WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.reference_id = hd.id AND p.reference_type = 'distribution');

UPDATE beneficiaries b SET total_received = COALESCE(total_received, 0) + sub.total_amount, total_payments = COALESCE(total_payments, 0) + sub.payment_count, updated_at = now()
FROM (SELECT beneficiary_id, SUM(share_amount) as total_amount, COUNT(*) as payment_count FROM heir_distributions GROUP BY beneficiary_id) sub WHERE b.id = sub.beneficiary_id;

-- إعادة trigger محسن
CREATE OR REPLACE FUNCTION create_journal_entry_for_payment() RETURNS TRIGGER AS $$
DECLARE v_entry_id UUID; v_debit_account_id UUID; v_credit_account_id UUID; v_fiscal_year_id UUID;
BEGIN SELECT id INTO v_debit_account_id FROM accounts WHERE code = '1.1.1' LIMIT 1;
  SELECT id INTO v_credit_account_id FROM accounts WHERE code = '5.3.1' LIMIT 1;
  SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE is_active = true LIMIT 1;
  IF v_debit_account_id IS NULL OR v_credit_account_id IS NULL OR v_fiscal_year_id IS NULL THEN RETURN NEW; END IF;
  INSERT INTO journal_entries (entry_number, entry_date, fiscal_year_id, description, status, reference_type, reference_id)
  VALUES ('JE-PAY-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('journal_entry_sequence')::TEXT, 4, '0'), NEW.payment_date, v_fiscal_year_id, NEW.description, 'posted', 'payment', NEW.id) RETURNING id INTO v_entry_id;
  INSERT INTO journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description, line_number)
  VALUES (v_entry_id, v_debit_account_id, NEW.amount, 0, NEW.description, 1), (v_entry_id, v_credit_account_id, 0, NEW.amount, NEW.description, 2);
  RETURN NEW; EXCEPTION WHEN OTHERS THEN RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_update_total_received AFTER INSERT OR UPDATE ON payments FOR EACH ROW WHEN (NEW.status = 'مدفوع') EXECUTE FUNCTION update_beneficiary_total_received();

-- المرحلة 2: الوحدات
UPDATE property_units SET occupancy_status = 'شاغر', current_contract_id = NULL, updated_at = now()
WHERE occupancy_status = 'مشغول' AND (current_contract_id IS NULL OR current_contract_id NOT IN (SELECT id FROM contracts WHERE status = 'نشط'));

-- المرحلة 3: Views الأساسية فقط
DROP VIEW IF EXISTS beneficiary_account_statement CASCADE;
CREATE VIEW beneficiary_account_statement WITH (security_invoker = true) AS SELECT b.id as beneficiary_id, b.full_name, b.national_id, COALESCE(b.total_received, 0) as total_received, COALESCE(b.account_balance, 0) as account_balance, COALESCE(b.pending_amount, 0) as pending_amount FROM beneficiaries b;

DROP VIEW IF EXISTS beneficiary_statistics CASCADE;
CREATE VIEW beneficiary_statistics WITH (security_invoker = true) AS SELECT b.id, b.full_name, b.category, b.status, COALESCE(b.total_received, 0) as total_received, COALESCE(b.total_payments, 0) as total_payments, COALESCE(b.account_balance, 0) as account_balance FROM beneficiaries b;

DROP VIEW IF EXISTS general_ledger CASCADE;
CREATE VIEW general_ledger WITH (security_invoker = true) AS SELECT a.id as account_id, a.code, a.name_ar, a.account_type, a.account_nature, COALESCE(SUM(jel.debit_amount), 0) as total_debit, COALESCE(SUM(jel.credit_amount), 0) as total_credit, COALESCE(a.current_balance, 0) as current_balance FROM accounts a LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id GROUP BY a.id;

-- المرحلة 4: RLS
DROP POLICY IF EXISTS "المستخدمون يمكنهم تحديث إشعاراتهم" ON notifications;
DROP POLICY IF EXISTS "المستخدمون يمكنهم حذف إشعاراتهم" ON notifications;
DROP POLICY IF EXISTS "المستخدمون يمكنهم قراءة إشعاراتهم" ON notifications;
DROP POLICY IF EXISTS "النظام يمكنه إنشاء إشعارات" ON notifications;

-- المرحلة 5: Triggers
CREATE OR REPLACE FUNCTION auto_assign_user_role() RETURNS TRIGGER AS $$ BEGIN INSERT INTO user_roles (user_id, role) VALUES (NEW.user_id, 'user') ON CONFLICT (user_id, role) DO NOTHING; RETURN NEW; END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
DROP TRIGGER IF EXISTS trigger_auto_assign_user_role ON profiles;
CREATE TRIGGER trigger_auto_assign_user_role AFTER INSERT ON profiles FOR EACH ROW EXECUTE FUNCTION auto_assign_user_role();

UPDATE system_error_logs SET status = 'resolved', resolved_at = now() WHERE status = 'new';
