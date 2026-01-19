# قواعد النزاهة (Invariants) - لا يجب أن تنكسر أبداً

> **آخر تحديث:** 2026-01-19  
> **المراجع:** التحليل الجنائي الشامل للنظام

---

## ⚠️ تحذيرات حرجة للمطورين

### 1. PostgreSQL Triggers bypass RLS

```
⚠️ CRITICAL: Triggers لا تخضع لـ Row Level Security (RLS)
- كل فحص صلاحيات داخل Trigger يجب أن يكون explicit
- لا تفترض أن RLS ستحمي البيانات داخل Trigger
- auth.uid() = NULL في cron jobs و triggers
```

### 2. الـ 265 Trigger في النظام

```
الجداول الأكثر كثافة بالـ triggers:
- contracts: 13 triggers
- payment_vouchers: 13 triggers  
- rental_payments: 12 triggers
- user_roles: 5 triggers (audit)

⚠️ عند bulk import:
SET session_replication_role = replica; -- (maintenance mode فقط)
-- هذا يوقف الـ triggers مؤقتاً
```

### 3. SECURITY DEFINER Functions

```
⚠️ 25+ دالة مالية محمية بـ role check
- لا تستدعِ هذه الدوال مباشرة بدون سياق auth
- المبالغ > 10,000 تتطلب صلاحية مالية
- التوزيعات > 50,000 تتطلب موافقة الناظر
```

---

## 1. النزاهة المالية

| القاعدة | الحماية | الجدول |
|---------|---------|--------|
| كل `payment_voucher` له `voucher_number` فريد | UNIQUE constraint | `payment_vouchers` |
| كل `journal_entry` له `entry_number` فريد | UNIQUE constraint | `journal_entries` |
| كل `invoice` له `invoice_number` فريد | UNIQUE constraint | `invoices` |
| لا يمكن حذف `contract` له `payment_vouchers` | ON DELETE RESTRICT | `payment_vouchers` |
| لا يمكن حذف `beneficiary` له `loans` | ON DELETE RESTRICT | `loans` |
| لا يمكن حذف `beneficiary` له `distribution_details` | ON DELETE RESTRICT | `distribution_details` |

---

## 2. نزاهة العقارات

| القاعدة | الحماية | الجدول |
|---------|---------|--------|
| كل `property_unit` له `unit_number` فريد ضمن العقار | UNIQUE (property_id, unit_number) | `property_units` |
| `property.total_units` يُحدّث تلقائياً | Trigger + Fallback code | `properties` |

---

## 3. نزاهة الصلاحيات

| القاعدة | الحماية |
|---------|---------|
| `user_roles` محمية بـ RLS | 4 policies + 5 audit triggers |
| تغيير الدور يُسجّل في `audit_logs` | Trigger on UPDATE/DELETE |
| المبالغ > 10,000 تتطلب صلاحية مالية | SECURITY DEFINER check |
| التوزيعات > 50,000 تتطلب موافقة الناظر | Trigger check |

---

## 4. نزاهة التوزيع

| القاعدة | الحماية |
|---------|---------|
| 3 موافقات مطلوبة للاعتماد | Workflow system |
| لا يمكن حذف توزيع له تفاصيل | ON DELETE RESTRICT |

---

## 5. Idempotency Rules

| العملية | الحماية | السلوك عند التكرار |
|---------|---------|-------------------|
| إنشاء وحدة عقارية | UNIQUE + isUniqueViolation() | إرجاع الوحدة الموجودة |
| إنشاء سند قبض | UNIQUE voucher_number | رفض مع error |
| إنشاء قيد محاسبي | UNIQUE entry_number | رفض مع error |

---

## 6. Retry Safety

| العملية | آمنة للـ Retry | السبب |
|---------|---------------|-------|
| SELECT | ✅ نعم | لا تغيير |
| INSERT مع UNIQUE | ✅ نعم | Constraint يمنع التكرار |
| INSERT بدون UNIQUE | ❌ لا | قد يُنشئ تكرارات |
| UPDATE | ⚠️ حذر | Idempotent إذا كانت القيم ثابتة |
| DELETE | ✅ نعم | الحذف مرتين = نفس النتيجة |

---

## 7. FK Relationships Protected

```
✅ ON DELETE RESTRICT:
- payment_vouchers.contract_id → contracts.id
- loans.beneficiary_id → beneficiaries.id
- distribution_details.beneficiary_id → beneficiaries.id

⚠️ ON DELETE CASCADE (حذر):
- بعض الجداول الفرعية تُحذف تلقائياً مع الأب
```

---

## 8. Audit Trail

```
✅ جدول audit_logs:
- يُسجّل كل تغيير حساس
- لا يمكن حذفه (RLS INSERT only للمستخدمين)
- 265 trigger تغذيه تلقائياً
```

---

## القاعدة الذهبية

> **Idempotency = Constraint + Error Handling**  
> وليس check-before-insert.

```typescript
// ❌ خطأ (race condition)
const exists = await checkExists(id);
if (!exists) await insert(data);

// ✅ صحيح (constraint-based)
const { error } = await insert(data);
if (isUniqueViolation(error)) {
  return await fetchExisting(id);
}
```

---

## المراجع

- [RLS_POLICIES.md](./RLS_POLICIES.md) - سياسات أمان الصفوف
- [THREAT_MODEL.md](./THREAT_MODEL.md) - نموذج التهديدات
- [retry-helper.ts](../../src/lib/retry-helper.ts) - دوال Idempotency
