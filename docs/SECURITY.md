# دليل الأمان - منصة إدارة الوقف الإلكترونية

> **الإصدار:** 2.6.15  
> **آخر تحديث:** 2025-12-05

## نظرة عامة

يتبع هذا التطبيق أفضل ممارسات الأمان لحماية بيانات الوقف والمستفيدين، بما في ذلك:

- **Row Level Security (RLS)** على جميع الجداول الحساسة
- **Role-Based Access Control (RBAC)** للتحكم في الوصول
- **تشفير البيانات** أثناء النقل والتخزين
- **سجل تدقيق شامل** لجميع العمليات الحساسة

---

## الأدوار والصلاحيات

### أدوار النظام

| الدور | الوصف | الصلاحيات الرئيسية |
|-------|-------|-------------------|
| `admin` | مدير النظام | جميع الصلاحيات |
| `nazer` | ناظر الوقف | إدارة التوزيعات، إقفال السنوات، الموافقات |
| `accountant` | المحاسب | القيود المحاسبية، التقارير المالية |
| `cashier` | أمين الصندوق | تسجيل المدفوعات والإيصالات |
| `archivist` | الأرشيفي | إدارة الوثائق والمرفقات |
| `waqf_heir` | وريث الوقف | الاطلاع الكامل على بيانات الوقف |
| `beneficiary` | المستفيد | الوصول لبياناته فقط |

### مصفوفة الصلاحيات للـ Edge Functions

| الدالة | الأدوار المسموحة |
|--------|-----------------|
| `backup-database` | admin, nazer |
| `restore-database` | admin |
| `auto-close-fiscal-year` | nazer |
| `simulate-distribution` | admin, nazer, accountant |
| `generate-ai-insights` | admin, nazer, accountant |
| `create-beneficiary-accounts` | admin, nazer |
| `reset-user-password` | admin, nazer |
| `update-user-email` | admin, nazer |

---

## تأمين Edge Functions

### نمط المصادقة والتفويض

جميع Edge Functions الحساسة تتبع هذا النمط:

```typescript
// 1. التحقق من وجود Authorization header
const authHeader = req.headers.get('Authorization');
if (!authHeader) {
  return forbiddenResponse('مطلوب تسجيل الدخول');
}

// 2. التحقق من صحة JWT token
const token = authHeader.replace('Bearer ', '');
const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
if (error || !user) {
  return forbiddenResponse('جلسة غير صالحة');
}

// 3. التحقق من الأدوار المطلوبة
const { data: userRoles } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id);

const hasPermission = userRoles?.some(r => ALLOWED_ROLES.includes(r.role));
if (!hasPermission) {
  // تسجيل المحاولة في audit_logs
  await supabase.from('audit_logs').insert({
    user_id: user.id,
    action_type: 'UNAUTHORIZED_ACCESS_ATTEMPT',
    severity: 'error'
  });
  return forbiddenResponse('ليس لديك الصلاحية المطلوبة');
}
```

### الدوال المحمية

| الدالة | verify_jwt | التحقق من الأدوار | سجل التدقيق |
|--------|-----------|------------------|-------------|
| backup-database | ✅ | ✅ admin/nazer | ✅ |
| restore-database | ✅ | ✅ admin | ✅ |
| auto-close-fiscal-year | ✅ | ✅ nazer | ✅ |
| simulate-distribution | ✅ | ✅ admin/nazer/accountant | ✅ |
| generate-ai-insights | ✅ | ✅ admin/nazer/accountant | ✅ |

---

## سياسات Row Level Security (RLS)

### الجداول الحساسة المحمية

#### 1. `beneficiaries` (المستفيدون)
- المستفيد يرى بياناته فقط
- الموظفون يرون جميع المستفيدين
- الورثة لهم شفافية كاملة

#### 2. `bank_accounts` (الحسابات البنكية)
- المستفيد يرى حسابه فقط
- المحاسب والناظر يرون جميع الحسابات

#### 3. `loans` (القروض)
- المستفيد يرى قروضه فقط
- المحاسب والناظر يديرون جميع القروض

#### 4. `distributions` (التوزيعات)
- المستفيد يرى توزيعاته فقط
- الورثة لهم شفافية كاملة

#### 5. `contracts` (العقود)
- الموظفون فقط يرون العقود
- الورثة لهم شفافية كاملة

### سياسات موحدة

بعد التنظيف، أصبحت السياسات كالتالي:

#### `profiles`
- `profiles_select_own`: المستخدم يرى ملفه
- `profiles_select_staff`: الموظفون يرون جميع الملفات
- `profiles_insert_own`: المستخدم ينشئ ملفه
- `profiles_update_own`: المستخدم يحدث ملفه

#### `user_roles`
- `user_roles_select_own`: المستخدم يرى أدواره
- `user_roles_select_admin`: المدير/الناظر يرون جميع الأدوار
- `user_roles_admin_manage`: المدير/الناظر يديرون الأدوار

#### `contract_units`
- `staff_view_contract_units`: الموظفون والورثة فقط

---

## سجل التدقيق (Audit Logs)

يتم تسجيل جميع العمليات الحساسة في جدول `audit_logs`:

```typescript
interface AuditLog {
  user_id: string;
  user_email: string;
  action_type: string;
  table_name: string;
  record_id?: string;
  old_values?: object;
  new_values?: object;
  description: string;
  severity: 'info' | 'warn' | 'error';
  ip_address?: string;
  user_agent?: string;
}
```

### أنواع الأحداث المسجلة

| نوع الحدث | الوصف |
|-----------|-------|
| `BACKUP_CREATED` | إنشاء نسخة احتياطية |
| `DATABASE_RESTORED` | استعادة قاعدة البيانات |
| `FISCAL_YEAR_CLOSED` | إقفال سنة مالية |
| `DISTRIBUTION_SIMULATION` | محاكاة توزيع |
| `AI_INSIGHTS_GENERATED` | إنشاء تحليل ذكي |
| `UNAUTHORIZED_*_ATTEMPT` | محاولة وصول غير مصرح |
| `USER_CREATED` | إنشاء مستخدم |
| `PASSWORD_RESET` | إعادة تعيين كلمة مرور |

---

## أفضل الممارسات

### للمطورين

1. **لا تستخدم `verify_jwt = false`** إلا للدوال العامة فعلاً
2. **تحقق دائماً من الأدوار** قبل تنفيذ عمليات حساسة
3. **سجّل جميع المحاولات** سواء نجحت أم فشلت
4. **استخدم `service_role`** للعمليات الداخلية فقط

### للمستخدمين

1. استخدم كلمات مرور قوية
2. فعّل المصادقة الثنائية إن توفرت
3. لا تشارك بيانات الدخول
4. أبلغ عن أي نشاط مشبوه

---

## تحديثات الأمان

### الإصدار 2.6.15 (2025-12-05)

✅ **تم إصلاحه:**
- تأمين `backup-database` (admin/nazer)
- تأمين `restore-database` (admin فقط)
- تأمين `auto-close-fiscal-year` (nazer)
- تأمين `simulate-distribution` (admin/nazer/accountant)
- تأمين `generate-ai-insights` (admin/nazer/accountant)
- تفعيل JWT لـ `contract-renewal-alerts`
- تشديد RLS على `contract_units` و `tasks`
- تنظيف سياسات `profiles` (14 → 4)
- تنظيف سياسات `user_roles` (8 → 3)

---

## الإبلاغ عن ثغرات

إذا اكتشفت ثغرة أمنية، يرجى:

1. **لا تنشر الثغرة علناً**
2. تواصل مع فريق التطوير مباشرة
3. قدم تفاصيل كاملة عن الثغرة
4. انتظر التأكيد قبل الإفصاح

---

*آخر مراجعة أمنية: 2025-12-05*
