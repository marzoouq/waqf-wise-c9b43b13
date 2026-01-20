# قواعد النزاهة (Invariants) - لا يجب أن تنكسر أبداً

> **آخر تحديث:** 2026-01-20  
> **المراجع:** التحليل الجنائي الشامل للنظام + الامتثال الشرعي للوقف

---

## 🕋 قواعد الحوكمة الشرعية للوقف (جديد)

### 1. منع الحذف الفيزيائي (Hard Delete Forbidden)

```
⛔ الحذف الفيزيائي ممنوع منعاً باتاً في الجداول المالية:
- payment_vouchers
- journal_entries
- distributions
- contracts
- loans
- rental_payments
- invoices

✅ البديل: Soft Delete عبر تحديث deleted_at + deleted_by + deletion_reason
```

**الحماية:**
- `prevent_hard_delete_financial()` trigger يمنع DELETE
- رسالة الخطأ: "الحذف الفيزيائي ممنوع في نظام الوقف المالي"

### 2. حماية الختم الزمني (Immutable Timestamps)

```
⚠️ created_at غير قابل للتعديل في الجداول المالية:
- أي محاولة لتغيير created_at تُرفض
- الختم الزمني يُملأ من قاعدة البيانات فقط (now())
```

**الحماية:**
- `protect_created_at()` trigger يمنع تعديل created_at
- رسالة الخطأ: "تعديل created_at ممنوع - الختم الزمني غير قابل للتغيير"

### 3. فصل الولاية (Dual Control)

```
🔐 قاعدة: المنشئ ≠ المعتمد للمبالغ الكبيرة

| نوع العملية | الحد | الشرط |
|------------|------|-------|
| سندات الصرف | > 10,000 ر.س | approved_by ≠ created_by |
| التوزيعات | > 50,000 ر.س | approved_by ≠ created_by |
| التحويلات البنكية | > 10,000 ر.س | موافقتان على الأقل |
```

**الحماية:**
- `enforce_dual_control()` trigger يفحص الشرط
- رسالة الخطأ: "المبالغ الكبيرة تتطلب موافقة من شخص مختلف عن المنشئ"

### 4. سجل التدقيق غير قابل للتعديل (Immutable Audit)

```
📜 جدول audit_logs:
- INSERT: ✅ مسموح
- SELECT: ✅ مسموح
- UPDATE: ❌ ممنوع
- DELETE: ❌ ممنوع
```

**الحماية:**
- `immutable_audit_logs()` trigger
- REVOKE UPDATE, DELETE ON audit_logs FROM authenticated/anon

---

## ⚠️ تحذيرات حرجة للمطورين

### 1. PostgreSQL Triggers bypass RLS

```
⚠️ CRITICAL: Triggers لا تخضع لـ Row Level Security (RLS)
- كل فحص صلاحيات داخل Trigger يجب أن يكون explicit
- لا تفترض أن RLS ستحمي البيانات داخل Trigger
- auth.uid() = NULL في cron jobs و triggers
```

### 2. الـ 270+ Trigger في النظام

```
الجداول الأكثر كثافة بالـ triggers:
- contracts: 15 triggers (+ soft delete + timestamp protection)
- payment_vouchers: 15 triggers (+ soft delete + timestamp protection + dual control)
- rental_payments: 14 triggers
- distributions: 13 triggers
- user_roles: 5 triggers (audit)

⚠️ عند bulk import:
SET session_replication_role = replica; -- (maintenance mode فقط)
-- هذا يوقف الـ triggers مؤقتاً
```

### 3. SECURITY DEFINER Functions

```
⚠️ 30+ دالة مالية محمية بـ role check
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
| لا يمكن حذف `contract` له `payment_vouchers` | ON DELETE RESTRICT + Soft Delete | `payment_vouchers` |
| لا يمكن حذف `beneficiary` له `loans` | ON DELETE RESTRICT + Soft Delete | `loans` |
| لا يمكن حذف `beneficiary` له `distribution_details` | ON DELETE RESTRICT | `distribution_details` |
| **الحذف الفيزيائي ممنوع** | Trigger + Soft Delete | جميع الجداول المالية |

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
| المبالغ > 10,000 تتطلب صلاحية مالية | `enforce_dual_control()` trigger |
| التوزيعات > 50,000 تتطلب موافقة الناظر | `enforce_dual_control()` trigger |

---

## 4. نزاهة التوزيع

| القاعدة | الحماية |
|---------|---------|
| 3 موافقات مطلوبة للاعتماد | Workflow system |
| لا يمكن حذف توزيع له تفاصيل | ON DELETE RESTRICT + Soft Delete |
| فصل الولاية للمبالغ > 50,000 | `enforce_dual_control()` trigger |

---

## 5. Idempotency Rules

| العملية | الحماية | السلوك عند التكرار |
|---------|---------|-------------------|
| إنشاء وحدة عقارية | UNIQUE + isUniqueViolation() | إرجاع الوحدة الموجودة |
| إنشاء سند قبض | UNIQUE voucher_number | رفض مع error |
| إنشاء قيد محاسبي | UNIQUE entry_number | رفض مع error |
| حذف سجل مالي | Soft Delete | تحديث deleted_at (idempotent) |

---

## 6. Retry Safety

| العملية | آمنة للـ Retry | السبب |
|---------|---------------|-------|
| SELECT | ✅ نعم | لا تغيير |
| INSERT مع UNIQUE | ✅ نعم | Constraint يمنع التكرار |
| INSERT بدون UNIQUE | ❌ لا | قد يُنشئ تكرارات |
| UPDATE | ⚠️ حذر | Idempotent إذا كانت القيم ثابتة |
| DELETE (Hard) | ⛔ ممنوع | استخدم Soft Delete |
| Soft Delete | ✅ نعم | تحديث deleted_at = idempotent |

---

## 7. FK Relationships Protected

```
✅ ON DELETE RESTRICT:
- payment_vouchers.contract_id → contracts.id
- loans.beneficiary_id → beneficiaries.id
- distribution_details.beneficiary_id → beneficiaries.id
- journal_entries (لا يمكن حذفها - trigger)

✅ Soft Delete Protection:
- جميع الجداول المالية محمية من DELETE
- البديل: UPDATE deleted_at
```

---

## 8. Audit Trail

```
✅ جدول audit_logs:
- يُسجّل كل تغيير حساس
- غير قابل للتعديل أو الحذف (trigger + REVOKE)
- 270+ trigger تغذيه تلقائياً
- الاحتفاظ: 99 سنة (لا حذف)
```

---

## 9. جدول الحدود المالية

```sql
-- مخزنة في waqf_governance_config
SELECT * FROM waqf_governance_config;

| config_key | config_value |
|------------|--------------|
| dual_control_threshold_voucher | {"amount": 10000, "currency": "SAR"} |
| dual_control_threshold_distribution | {"amount": 50000, "currency": "SAR"} |
| audit_retention_years | {"years": 99} |
| soft_delete_enabled | {"enabled": true} |
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

// ✅ صحيح (Soft Delete بدلاً من Hard Delete)
await supabase.from('payment_vouchers')
  .update({ 
    deleted_at: new Date().toISOString(),
    deleted_by: userId,
    deletion_reason: 'سبب الحذف'
  })
  .eq('id', voucherId);
```

---

## المراجع

- [WAQF_FINANCIAL_GOVERNANCE.md](../WAQF_FINANCIAL_GOVERNANCE.md) - وثيقة الحوكمة الشرعية
- [RLS_POLICIES.md](./RLS_POLICIES.md) - سياسات أمان الصفوف
- [THREAT_MODEL.md](./THREAT_MODEL.md) - نموذج التهديدات
- [soft-delete.service.ts](../../src/services/shared/soft-delete.service.ts) - خدمة الحذف اللين
- [retry-helper.ts](../../src/lib/retry-helper.ts) - دوال Idempotency
