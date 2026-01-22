
-- ============================================
-- المرحلة 3: دوال وTriggers لإعادة احتساب الأرصدة
-- ============================================

-- 1. دالة إعادة احتساب جميع أرصدة الحسابات من القيود الفعلية
CREATE OR REPLACE FUNCTION public.recalculate_all_account_balances()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- إعادة حساب كل الأرصدة من القيود المرحَّلة غير المحذوفة
  UPDATE accounts a
  SET 
    current_balance = COALESCE((
      SELECT CASE 
        WHEN a.account_nature = 'debit' THEN SUM(COALESCE(jel.debit_amount, 0)) - SUM(COALESCE(jel.credit_amount, 0))
        ELSE SUM(COALESCE(jel.credit_amount, 0)) - SUM(COALESCE(jel.debit_amount, 0))
      END
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON je.id = jel.journal_entry_id
      WHERE jel.account_id = a.id
        AND je.deleted_at IS NULL
        AND je.status = 'posted'
    ), 0),
    updated_at = NOW();
END;
$$;

-- 2. دالة لإعادة حساب رصيد حساب معين
CREATE OR REPLACE FUNCTION public.recalculate_account_balance(p_account_id uuid)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance numeric;
  v_nature text;
BEGIN
  -- جلب طبيعة الحساب
  SELECT account_nature INTO v_nature FROM accounts WHERE id = p_account_id;
  
  -- حساب الرصيد
  SELECT CASE 
    WHEN v_nature = 'debit' THEN SUM(COALESCE(jel.debit_amount, 0)) - SUM(COALESCE(jel.credit_amount, 0))
    ELSE SUM(COALESCE(jel.credit_amount, 0)) - SUM(COALESCE(jel.debit_amount, 0))
  END
  INTO v_balance
  FROM journal_entry_lines jel
  INNER JOIN journal_entries je ON je.id = jel.journal_entry_id
  WHERE jel.account_id = p_account_id
    AND je.deleted_at IS NULL
    AND je.status = 'posted';
  
  -- تحديث الرصيد
  UPDATE accounts 
  SET current_balance = COALESCE(v_balance, 0), updated_at = NOW()
  WHERE id = p_account_id;
  
  RETURN COALESCE(v_balance, 0);
END;
$$;

-- 3. دالة Trigger لإعادة الأرصدة عند حذف قيد (soft delete)
CREATE OR REPLACE FUNCTION public.on_journal_entry_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_account_id uuid;
BEGIN
  -- يُنفذ فقط عند تحديث deleted_at من NULL إلى قيمة
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- إعادة حساب أرصدة الحسابات المتأثرة
    FOR v_account_id IN 
      SELECT DISTINCT account_id FROM journal_entry_lines WHERE journal_entry_id = OLD.id
    LOOP
      PERFORM recalculate_account_balance(v_account_id);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. إنشاء Trigger على جدول القيود
DROP TRIGGER IF EXISTS trigger_journal_entry_soft_delete ON journal_entries;
CREATE TRIGGER trigger_journal_entry_soft_delete
AFTER UPDATE ON journal_entries
FOR EACH ROW
WHEN (NEW.deleted_at IS DISTINCT FROM OLD.deleted_at)
EXECUTE FUNCTION on_journal_entry_soft_delete();

-- 5. تشغيل إعادة الاحتساب الآن للتأكد من صحة جميع الأرصدة
SELECT recalculate_all_account_balances();
