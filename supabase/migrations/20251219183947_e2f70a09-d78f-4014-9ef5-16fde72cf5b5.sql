-- =====================================================
-- الخطة الشاملة 100%: إصلاح جميع المشاكل المحاسبية
-- =====================================================

-- المرحلة 1: تصحيح جميع أرصدة الحسابات من القيود المحاسبية
-- =====================================================
UPDATE accounts 
SET current_balance = COALESCE(calculated.correct_balance, 0),
    updated_at = now()
FROM (
  SELECT 
    a.id,
    CASE 
      WHEN a.account_nature = 'credit' 
      THEN COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0)
      ELSE COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0)
    END as correct_balance
  FROM accounts a
  LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
  LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
  GROUP BY a.id, a.account_nature
) as calculated
WHERE accounts.id = calculated.id;

-- المرحلة 2: إنشاء Trigger لتحديث الأرصدة تلقائياً
-- =====================================================

-- حذف الـ Trigger والـ Function إن وجدت
DROP TRIGGER IF EXISTS auto_update_account_balance ON journal_entry_lines;
DROP FUNCTION IF EXISTS update_account_balance_on_entry();

-- إنشاء Function لتحديث الرصيد
CREATE OR REPLACE FUNCTION update_account_balance_on_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_account_nature text;
  v_old_account_nature text;
BEGIN
  -- للإدراج أو التحديث
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- جلب طبيعة الحساب الجديد
    SELECT account_nature INTO v_account_nature 
    FROM accounts WHERE id = NEW.account_id;
    
    -- تحديث رصيد الحساب الجديد
    UPDATE accounts
    SET current_balance = (
      SELECT CASE 
        WHEN account_nature = 'credit' 
        THEN COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0)
        ELSE COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0)
      END
      FROM accounts a
      LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
      WHERE a.id = NEW.account_id
      GROUP BY a.account_nature
    ),
    updated_at = now()
    WHERE id = NEW.account_id;
  END IF;
  
  -- للحذف أو التحديث (الحساب القديم)
  IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.account_id != NEW.account_id) THEN
    -- تحديث رصيد الحساب القديم
    UPDATE accounts
    SET current_balance = (
      SELECT CASE 
        WHEN account_nature = 'credit' 
        THEN COALESCE(SUM(jel.credit_amount), 0) - COALESCE(SUM(jel.debit_amount), 0)
        ELSE COALESCE(SUM(jel.debit_amount), 0) - COALESCE(SUM(jel.credit_amount), 0)
      END
      FROM accounts a
      LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
      LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id AND je.status = 'posted'
      WHERE a.id = OLD.account_id
      GROUP BY a.account_nature
    ),
    updated_at = now()
    WHERE id = OLD.account_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- إنشاء الـ Trigger
CREATE TRIGGER auto_update_account_balance
AFTER INSERT OR UPDATE OR DELETE ON journal_entry_lines
FOR EACH ROW EXECUTE FUNCTION update_account_balance_on_entry();

-- المرحلة 3: حذف سياسات INSERT المتضاربة (13 سياسة)
-- =====================================================

-- 1. approvals
DROP POLICY IF EXISTS "المحاسبون يمكنهم إضافة الموافقات" ON approvals;

-- 2. audit_logs
DROP POLICY IF EXISTS "system_insert_audit_logs_secure" ON audit_logs;

-- 3. auto_journal_log
DROP POLICY IF EXISTS "auto_journal_log_insert_optimized" ON auto_journal_log;

-- 4. bank_reconciliation_matches
DROP POLICY IF EXISTS "financial_staff_can_insert_bank_reconciliation_matches" ON bank_reconciliation_matches;

-- 5. beneficiary_activity_log
DROP POLICY IF EXISTS "beneficiary_activity_log_insert_policy" ON beneficiary_activity_log;

-- 6. beneficiary_attachments
DROP POLICY IF EXISTS "المستفيدون يمكنهم إضافة مرفقات" ON beneficiary_attachments;

-- 7. distribution_details (تحقق من وجودها أولاً)
DROP POLICY IF EXISTS "staff_insert_distribution_details" ON distribution_details;
DROP POLICY IF EXISTS "distribution_details_insert_policy" ON distribution_details;

-- 8. fiscal_years
DROP POLICY IF EXISTS "fiscal_years_insert_policy" ON fiscal_years;

-- 9. journal_entries
DROP POLICY IF EXISTS "المحاسبون يمكنهم إضافة القيود" ON journal_entries;

-- 10. journal_entry_lines
DROP POLICY IF EXISTS "المحاسبون يمكنهم إضافة أسطر القيود" ON journal_entry_lines;

-- 11. notifications
DROP POLICY IF EXISTS "notifications_insert_policy" ON notifications;

-- 12. payment_vouchers
DROP POLICY IF EXISTS "المحاسبون يمكنهم إضافة سندات الصرف" ON payment_vouchers;

-- 13. properties
DROP POLICY IF EXISTS "properties_insert_policy" ON properties;

-- تنظيف أي سياسات مكررة أخرى قد تكون موجودة
DROP POLICY IF EXISTS "المحاسبون يمكنهم تحديث الموافقات" ON approvals;
DROP POLICY IF EXISTS "المحاسبون يمكنهم تحديث القيود" ON journal_entries;
DROP POLICY IF EXISTS "المحاسبون يمكنهم تحديث أسطر القيود" ON journal_entry_lines;