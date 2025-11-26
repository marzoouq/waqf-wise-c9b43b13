-- المرحلة 15: تحديث جدول journal_entries الموجود

-- =====================================================
-- 1. إنشاء Enums الجديدة
-- =====================================================

DO $$ BEGIN
  CREATE TYPE entry_type AS ENUM ('manual', 'auto', 'adjustment', 'opening', 'closing');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE entry_status AS ENUM ('draft', 'pending', 'approved', 'rejected', 'posted');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- 2. تحديث جدول journal_entries
-- =====================================================

-- إضافة الأعمدة المفقودة
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS entry_type entry_type DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS reference_type TEXT,
ADD COLUMN IF NOT EXISTS reference_id UUID,
ADD COLUMN IF NOT EXISTS posted BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- إنشاء Sequence
CREATE SEQUENCE IF NOT EXISTS journal_entry_seq START 1;

-- إنشاء indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_posted ON journal_entries(posted);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON journal_entries(reference_type, reference_id);

-- =====================================================
-- 3. Views للتقارير
-- =====================================================

-- دفتر الأستاذ العام
CREATE OR REPLACE VIEW general_ledger AS
SELECT 
  a.code AS account_code,
  a.name_ar AS account_name,
  a.account_type,
  je.entry_number,
  je.entry_date,
  je.description AS entry_description,
  jel.description AS line_description,
  jel.debit_amount,
  jel.credit_amount,
  SUM(jel.debit_amount - jel.credit_amount) 
    OVER (PARTITION BY a.id ORDER BY je.entry_date, je.entry_number) AS running_balance,
  je.status,
  je.posted
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id
JOIN accounts a ON jel.account_id = a.id
WHERE je.posted = true
ORDER BY a.code, je.entry_date, je.entry_number;

-- ميزان المراجعة
CREATE OR REPLACE VIEW trial_balance AS
SELECT 
  a.code,
  a.name_ar,
  a.account_type,
  a.account_nature,
  COALESCE(SUM(jel.debit_amount), 0) AS total_debit,
  COALESCE(SUM(jel.credit_amount), 0) AS total_credit,
  COALESCE(SUM(jel.debit_amount - jel.credit_amount), 0) AS balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.posted = true
WHERE a.is_header = false
GROUP BY a.id, a.code, a.name_ar, a.account_type, a.account_nature
ORDER BY a.code;

COMMENT ON VIEW general_ledger IS 'دفتر الأستاذ العام - يعرض جميع القيود المرحّلة مع الأرصدة المتراكمة';
COMMENT ON VIEW trial_balance IS 'ميزان المراجعة - ملخص أرصدة الحسابات';