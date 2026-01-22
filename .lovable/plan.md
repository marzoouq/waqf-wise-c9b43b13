
# خطة إزالة مبلغ 1,300 ريال + إعادة احتساب الأرصدة

## الهدف
إزالة المبلغ الوهمي (1,300 ريال) من جميع التقارير واللوحات، مع إعادة احتساب الأرصدة من القيود الفعلية المرحَّلة.

---

## المرحلة 1: تنظيف قاعدة البيانات

### 1.1 حذف سطور القيد المرتبطة
```sql
UPDATE journal_entry_lines
SET deleted_at = NOW(), 
    deleted_by = NULL, 
    deletion_reason = 'حذف سطور قيد وهمي مرتبط بسند V-1768526034377'
WHERE journal_entry_id = 'e2925c24-903e-4f78-8129-3f0a065869ad'
  AND deleted_at IS NULL;
```

### 1.2 إعادة احتساب رصيد حساب النقدية والبنوك
```sql
WITH valid_lines AS (
  SELECT 
    jel.account_id,
    SUM(jel.debit_amount) as total_debit,
    SUM(jel.credit_amount) as total_credit
  FROM journal_entry_lines jel
  INNER JOIN journal_entries je ON je.id = jel.journal_entry_id
  WHERE je.deleted_at IS NULL 
    AND jel.deleted_at IS NULL
    AND je.status = 'posted'
  GROUP BY jel.account_id
)
UPDATE accounts a
SET current_balance = CASE 
  WHEN a.account_nature = 'debit' THEN COALESCE(vl.total_debit, 0) - COALESCE(vl.total_credit, 0)
  ELSE COALESCE(vl.total_credit, 0) - COALESCE(vl.total_debit, 0)
END
FROM valid_lines vl
WHERE a.id = vl.account_id;

-- تصفير الحسابات التي ليس لها قيود
UPDATE accounts
SET current_balance = 0
WHERE id NOT IN (
  SELECT DISTINCT jel.account_id 
  FROM journal_entry_lines jel
  INNER JOIN journal_entries je ON je.id = jel.journal_entry_id
  WHERE je.deleted_at IS NULL AND jel.deleted_at IS NULL AND je.status = 'posted'
);
```

---

## المرحلة 2: إصلاح الخدمات (طبقة الكود)

### 2.1 تحديث `JournalEntryService.getJournalEntriesWithLines`
- إضافة `.is('deleted_at', null)` لجدول `journal_entries`
- التحقق من أن سطور القيود تُستثنى المحذوفة

### 2.2 تحديث `JournalEntryService.updateAccountBalances`
- إضافة فلتر لاستثناء القيود المحذوفة عند إعادة الحساب

### 2.3 تحديث `FinancialCardsService.getRevenueProgress`
- إضافة `.is('deleted_at', null)` لجدول `payment_vouchers`

---

## المرحلة 3: إنشاء دالة إعادة احتساب الأرصدة

### 3.1 دالة `recalculate_all_account_balances()`
```sql
CREATE OR REPLACE FUNCTION recalculate_all_account_balances()
RETURNS void AS $$
BEGIN
  -- إعادة حساب كل الأرصدة من القيود المرحَّلة الفعلية
  UPDATE accounts a
  SET current_balance = COALESCE((
    SELECT CASE 
      WHEN a.account_nature = 'debit' THEN SUM(jel.debit_amount) - SUM(jel.credit_amount)
      ELSE SUM(jel.credit_amount) - SUM(jel.debit_amount)
    END
    FROM journal_entry_lines jel
    INNER JOIN journal_entries je ON je.id = jel.journal_entry_id
    WHERE jel.account_id = a.id
      AND je.deleted_at IS NULL
      AND jel.deleted_at IS NULL
      AND je.status = 'posted'
  ), 0);
END;
$$ LANGUAGE plpgsql;
```

### 3.2 Trigger للحذف التلقائي لإعادة الرصيد
```sql
CREATE OR REPLACE FUNCTION on_journal_entry_soft_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- إعادة حساب أرصدة الحسابات المتأثرة
    UPDATE accounts a
    SET current_balance = COALESCE((
      SELECT CASE 
        WHEN a.account_nature = 'debit' THEN SUM(jel.debit_amount) - SUM(jel.credit_amount)
        ELSE SUM(jel.credit_amount) - SUM(jel.debit_amount)
      END
      FROM journal_entry_lines jel
      INNER JOIN journal_entries je ON je.id = jel.journal_entry_id
      WHERE jel.account_id = a.id
        AND je.deleted_at IS NULL
        AND jel.deleted_at IS NULL
        AND je.status = 'posted'
    ), 0)
    WHERE a.id IN (
      SELECT account_id FROM journal_entry_lines WHERE journal_entry_id = OLD.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_journal_entry_soft_delete
AFTER UPDATE ON journal_entries
FOR EACH ROW
WHEN (NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL)
EXECUTE FUNCTION on_journal_entry_soft_delete();
```

---

## المرحلة 4: تحديث الاستعلامات في الخدمات

### الملفات المتأثرة:

| الملف | التغيير |
|-------|---------|
| `src/services/dashboard/kpi.service.ts` | إضافة `.is('deleted_at', null)` للسندات والقيود |
| `src/services/property/property-stats.service.ts` | إضافة `.is('deleted_at', null)` للسندات |
| `src/services/accounting/journal-entry.service.ts` | إضافة الفلاتر للقيود والسطور |
| `src/services/dashboard/financial-cards.service.ts` | إضافة الفلتر للسندات |

### مثال التغيير:
```typescript
// قبل
.from("payment_vouchers")
.select("amount")
.eq("voucher_type", "receipt")
.eq("status", "paid")

// بعد
.from("payment_vouchers")
.select("amount")
.eq("voucher_type", "receipt")
.eq("status", "paid")
.is("deleted_at", null)  // ← إضافة
```

---

## المرحلة 5: التحقق والاختبار

### 5.1 استعلامات التحقق
```sql
-- التحقق من رصيد النقدية
SELECT code, name_ar, current_balance FROM accounts WHERE code = '1.1.1';
-- يجب أن يكون: 0

-- التحقق من عدم وجود سندات نشطة بـ 1300
SELECT COUNT(*) FROM payment_vouchers WHERE amount = 1300 AND deleted_at IS NULL;
-- يجب أن يكون: 0

-- التحقق من عدم وجود قيود نشطة مرتبطة
SELECT COUNT(*) FROM journal_entries 
WHERE reference_id = 'd9f7a74b-5dec-470f-beb3-700063f8b798' AND deleted_at IS NULL;
-- يجب أن يكون: 0
```

### 5.2 اختبار اللوحات
- لوحة الناظر: إجمالي الأصول = 0
- لوحة المشرف: التحصيل = 0
- بطاقة الرصيد البنكي: 0 ر.س

---

## ملخص التنفيذ

| المرحلة | الإجراء | الأولوية |
|---------|---------|----------|
| 1 | تنظيف قاعدة البيانات (soft delete للسطور + إعادة احتساب) | 🔴 عاجل |
| 2 | إضافة فلاتر `deleted_at` للخدمات | 🔴 عاجل |
| 3 | إنشاء دالة وtrigger للحذف المستقبلي | 🟠 مهم |
| 4 | تحديث الاستعلامات | 🟠 مهم |
| 5 | التحقق والاختبار | 🟢 تأكيد |

---

## النتيجة المتوقعة

بعد التنفيذ:
- **إجمالي الأصول**: 0 ر.س
- **التحصيل الفعلي**: 0 ر.س
- **الرصيد البنكي**: 0 ر.س
- **الميزانية المتاحة**: 0 ر.س

مع ضمان أن أي حذف مستقبلي سيُعيد الأرصدة تلقائياً.
