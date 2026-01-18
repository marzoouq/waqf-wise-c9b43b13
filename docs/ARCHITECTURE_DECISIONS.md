# قرارات التصميم المعمارية (Architecture Decision Records)
> آخر تحديث: 2026-01-18

---

> ⚠️ **هذه الوثيقة ملزمة** لأي تغيير معماري أو أمني أو متعلق بالأداء.
> أي خرق لها يجب أن يكون مصحوبًا بـ ADR جديد.

---

## ADR-001: إغلاق جداول Tenant بـ USING(false)

### القرار
جداول `tenant_sessions`, `tenant_otp_codes`, `tenant_notifications` مغلقة تماماً بسياسات `USING(false)`.

### السبب
- **الأمان:** منع أي وصول مباشر من العميل
- **التحكم:** جميع العمليات تمر عبر Edge Function `tenant-portal`
- **المصادقة:** Edge Function يستخدم `SERVICE_ROLE_KEY` للوصول الآمن

### البدائل المرفوضة
| البديل | سبب الرفض |
|--------|-----------|
| `USING(tenant_id = auth.uid())` | المستأجر لا يستخدم Supabase Auth مباشرة |
| `USING(true)` | يفتح البيانات للجميع - خطر أمني |

### العواقب
- ✅ أمان أعلى
- ✅ تحكم مركزي في المصادقة
- ⚠️ يتطلب Edge Function لأي عملية

### الحالة
**Accepted** (معتمد) - 2026-01-18

---

## ADR-002: عدم استخدام VACUUM في Migrations

### القرار
لا نستخدم `VACUUM` أو `VACUUM ANALYZE` داخل Supabase Migrations.

### السبب
- **تقني:** Supabase Migrations تعمل داخل Transaction
- **قيود PostgreSQL:** `VACUUM` لا يعمل داخل Transaction
- **النتيجة:** الأمر يفشل صامتاً أو يُرمى خطأ

### البدائل المعتمدة
| البديل | الاستخدام |
|--------|-----------|
| SQL Editor | تشغيل VACUUM يدوياً عند الحاجة |
| Edge Function | `run-vacuum` مع صلاحيات service_role |
| Cron Job | للصيانة الدورية التلقائية |

### العواقب
- ✅ تجنب أخطاء صامتة
- ✅ تنفيذ مضمون
- ⚠️ يتطلب تدخل يدوي أو مجدول

### الحالة
**Accepted** (معتمد) - 2026-01-18

---

## ADR-003: سياسات USING(true) للبيانات المرجعية

### القرار
السماح بـ `USING(true)` للجداول المرجعية العامة فقط.

### الجداول المسموحة
| الجدول | السبب |
|--------|-------|
| `translations` | ترجمات عامة للنظام |
| `permissions` | قائمة الصلاحيات المتاحة |
| `role_permissions` | ربط الأدوار بالصلاحيات |
| `tribes` | بيانات قبائل مرجعية |
| `eligibility_criteria` | معايير أهلية عامة |
| `folders` | هيكل مجلدات الأرشيف |

### الجداول الممنوعة
| الجدول | السبب |
|--------|-------|
| `beneficiaries` | بيانات مالية حساسة |
| `contracts` | بيانات تعاقدية |
| `payment_vouchers` | بيانات مالية |
| `governance_board_members` | بيانات حوكمة |
| `tenant_*` | بيانات مستأجرين حساسة |

### معيار القرار
> إذا كان السؤال "هل يضر لو رآها مستخدم غير مصرح؟" جوابه **نعم** ← ممنوع USING(true)

### الحالة
**Accepted** (معتمد) - 2026-01-18

---

## ADR-004: تحديد Limits بـ 500 كحد أقصى

### القرار
لا يوجد `limit()` أكبر من 500 في الـ Hooks بدون Pagination.

### السبب
- **الأداء:** تقليل حجم البيانات المنقولة
- **الذاكرة:** تقليل استهلاك ذاكرة المتصفح
- **التجربة:** تحميل أسرع للمستخدم

### التنفيذ
| الملف | التغيير |
|-------|---------|
| `useAuditLogsEnhanced.ts` | `10000 → 500` |
| `useAuditLogsEnhanced.ts` | `5000 → 200` |

### الاستثناءات
- تقارير التصدير (مع streaming)
- Edge Functions (backend processing)

### الحالة
**Accepted** (معتمد) - 2026-01-18

---

## ADR-005: استخدام Service Role في Edge Functions للبيانات الحساسة

### القرار
Edge Functions التي تتعامل مع بيانات حساسة تستخدم `SERVICE_ROLE_KEY` مع حماية متعددة الطبقات.

### الوظائف المعنية
| الوظيفة | الوظيفة |
|---------|---------|
| `db-health-check` | فحص قاعدة البيانات |
| `backup-database` | النسخ الاحتياطي |
| `tenant-portal` | بوابة المستأجر |
| `distribute-revenue` | توزيع الإيرادات |
| `publish-fiscal-year` | نشر السنة المالية |

### الحماية المطبقة
```
┌─────────────────────────────────────────────┐
│  Layer 1: JWT Verification                  │
│  ↓                                          │
│  Layer 2: Role Check (admin/nazer)          │
│  ↓                                          │
│  Layer 3: Rate Limiting                     │
│  ↓                                          │
│  Layer 4: Audit Logging                     │
│  ↓                                          │
│  SERVICE_ROLE_KEY Access                    │
└─────────────────────────────────────────────┘
```

### الحالة
**Accepted** (معتمد) - 2026-01-18

---

## ADR-006: Dead Tuples - متى نتصرف؟

### القرار
لا نشغل VACUUM إلا عندما:
```
n_dead_tup > 1000 AND n_dead_tup > n_live_tup
```

### السبب
- **النسب المئوية مضللة:** جدول بـ 1 صف حي و 31 ميت = 3100%، لكنه غير مؤثر
- **الأرقام المطلقة:** 31 صف ميت لا يؤثر على الأداء
- **autovacuum:** PostgreSQL يتعامل معها تلقائياً

### استعلام الفحص
```sql
SELECT relname, n_live_tup, n_dead_tup,
  CASE 
    WHEN n_dead_tup > 1000 AND n_dead_tup > n_live_tup THEN 'NEEDS_VACUUM'
    ELSE 'OK'
  END as status
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY n_dead_tup DESC;
```

### الحالة
**Accepted** (معتمد) - 2026-01-18

---

## سجل القرارات

| ADR | القرار | التاريخ | الحالة |
|-----|--------|---------|--------|
| 001 | إغلاق جداول Tenant | 2026-01-18 | ✅ Accepted |
| 002 | عدم VACUUM في Migrations | 2026-01-18 | ✅ Accepted |
| 003 | USING(true) للمرجعيات | 2026-01-18 | ✅ Accepted |
| 004 | Limits بـ 500 | 2026-01-18 | ✅ Accepted |
| 005 | Service Role في EFs | 2026-01-18 | ✅ Accepted |
| 006 | معايير Dead Tuples | 2026-01-18 | ✅ Accepted |

---

## متى نكتب ADR جديد؟

اكتب ADR جديد **فقط** إذا:
- ✏️ فتحت جدولًا كان مغلقًا
- ✏️ غيرت سياسة RLS أساسية
- ✏️ رفعت limits فوق 500
- ✏️ أدخلت مسار وصول جديد للـ tenant
- ✏️ غيرت طريقة المراقبة أو الصيانة
- ✏️ أضفت Edge Function بـ SERVICE_ROLE_KEY

---

## القاعدة الذهبية

> ❗ **لا ADR = لا تغيير معماري**

---

## حالات ADR

| الحالة | المعنى |
|--------|--------|
| **Accepted** | معتمد ويجب اتباعه |
| **Superseded** | تم استبداله بـ ADR أحدث |
| **Deprecated** | قديم ولا يُنصح به |
| **Rejected** | مرفوض ولا يجب اتباعه |

---

## المراجع

- [TRUTH_MAP.md](./TRUTH_MAP.md) - خريطة مصادر الحقيقة
- [MONTHLY_CHECKLIST.md](./MONTHLY_CHECKLIST.md) - قائمة الفحص الشهري
- [RLS_POLICIES.md](./security/RLS_POLICIES.md) - سياسات أمان قاعدة البيانات
