# ⚡ توثيق Edge Functions

> دليل شامل لجميع وظائف Edge Functions في النظام

---

## 📊 الإحصائيات

| الفئة | العدد |
|-------|-------|
| **المجموع** | 50 وظيفة |
| **الفئات** | 11 فئة |

---

## 📁 هيكل المجلد

```
supabase/functions/
├── ai-system-audit/
├── auto-close-fiscal-year/
├── auto-create-journal/
├── backfill-rental-documents/
├── backup-database/
├── biometric-auth/
├── chatbot/
├── check-leaked-password/
├── cleanup-old-files/
├── cleanup-sensitive-files/
├── contract-renewal-alerts/
├── create-beneficiary-accounts/
├── create-test-beneficiaries/
├── daily-backup/
├── daily-notifications/
├── daily-notifications-full/
├── db-health-check/
├── db-performance-stats/
├── decrypt-file/
├── distribute-revenue/
├── encrypt-file/
├── enhanced-backup/
├── execute-auto-fix/
├── extract-contract-data/
├── extract-invoice-data/
├── generate-ai-insights/
├── generate-scheduled-report/
├── generate-smart-alerts/
├── intelligent-search/
├── log-batch/
├── log-error/
├── notify-admins/
├── notify-disclosure-published/
├── ocr-document/
├── property-ai-assistant/
├── publish-fiscal-year/
├── reset-user-password/
├── restore-database/
├── run-vacuum/
├── scheduled-cleanup/
├── secure-delete-file/
├── send-notification/
├── send-push-notification/
├── send-slack-alert/
├── simulate-distribution/
├── support-auto-escalate/
├── test-auth/
├── update-user-email/
├── weekly-maintenance/
├── weekly-report/
└── zatca-submit/
```

---

## 🤖 الذكاء الاصطناعي (AI)

### 1. chatbot

**الغرض:** المساعد الذكي للنظام

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('chatbot', {
  body: {
    message: "ما هو رصيد المستفيد؟",
    context: "beneficiary_portal",
    userId: "uuid"
  }
});

// الاستجابة
{
  response: "رصيد المستفيد الحالي هو...",
  suggestions: ["عرض كشف الحساب", "تقديم طلب"],
  confidence: 0.95
}
```

### 2. generate-ai-insights

**الغرض:** توليد رؤى ذكية من البيانات

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('generate-ai-insights', {
  body: {
    type: "financial",
    period: "monthly",
    fiscalYearId: "uuid"
  }
});

// الاستجابة
{
  insights: [
    { title: "...", description: "...", severity: "info" }
  ],
  recommendations: ["..."]
}
```

### 3. ai-system-audit

**الغرض:** تدقيق النظام باستخدام الذكاء الاصطناعي

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('ai-system-audit', {
  body: {
    auditType: "full",
    includeAutoFix: true
  }
});

// الاستجابة
{
  success: true,
  auditId: "uuid",
  findings: [...],
  autoFixesApplied: [...]
}
```

### 4. intelligent-search

**الغرض:** البحث الذكي في جميع البيانات

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('intelligent-search', {
  body: {
    query: "مستفيد محمد",
    filters: { category: "beneficiary" },
    limit: 10
  }
});
```

### 5. property-ai-assistant

**الغرض:** مساعد العقارات الذكي

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('property-ai-assistant', {
  body: {
    propertyId: "uuid",
    question: "ما هي توقعات الإيرادات؟"
  }
});
```

---

## 💰 المالية (Financial)

### 1. distribute-revenue

**الغرض:** توزيع الإيرادات على المستفيدين

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('distribute-revenue', {
  body: {
    fiscalYearId: "uuid",
    totalAmount: 100000,
    distributionType: "regular",
    beneficiaryIds: ["uuid1", "uuid2"]
  }
});

// الاستجابة
{
  success: true,
  distributionId: "uuid",
  totalDistributed: 100000,
  beneficiariesCount: 50,
  vouchersCreated: 50
}
```

### 2. simulate-distribution

**الغرض:** محاكاة التوزيع قبل التنفيذ

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('simulate-distribution', {
  body: {
    totalAmount: 100000,
    beneficiaryIds: ["uuid1", "uuid2"]
  }
});

// الاستجابة
{
  totalAmount: 100000,
  beneficiaryCount: 50,
  allocations: [
    { beneficiaryId: "...", amount: 2000, percentage: 2 }
  ],
  warnings: []
}
```

### 3. auto-create-journal

**الغرض:** إنشاء قيد محاسبي تلقائي

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('auto-create-journal', {
  body: {
    triggerEvent: "rental_payment",
    referenceId: "uuid",
    amount: 5000
  }
});
```

### 4. publish-fiscal-year

**الغرض:** نشر السنة المالية للمستفيدين

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('publish-fiscal-year', {
  body: {
    fiscalYearId: "uuid",
    publishedBy: "uuid"
  }
});
```

### 5. auto-close-fiscal-year

**الغرض:** إقفال السنة المالية تلقائيًا

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('auto-close-fiscal-year', {
  body: {
    fiscalYearId: "uuid"
  }
});
```

### 6. zatca-submit

**الغرض:** إرسال الفواتير لهيئة الزكاة والضريبة

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('zatca-submit', {
  body: {
    invoiceId: "uuid"
  }
});
```

---

## 🔔 الإشعارات (Notifications)

### 1. send-notification

**الغرض:** إرسال إشعار لمستخدم محدد

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('send-notification', {
  body: {
    userId: "uuid",
    title: "عنوان الإشعار",
    message: "محتوى الإشعار",
    type: "info",
    actionUrl: "/dashboard"
  }
});
```

### 2. send-push-notification

**الغرض:** إرسال إشعار فوري (Push)

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('send-push-notification', {
  body: {
    userId: "uuid",
    title: "إشعار عاجل",
    body: "لديك توزيع جديد"
  }
});
```

### 3. daily-notifications

**الغرض:** إرسال الإشعارات اليومية

```typescript
// يتم استدعاؤها تلقائيًا عبر Cron
// الاستدعاء اليدوي
const { data } = await supabase.functions.invoke('daily-notifications');
```

### 4. notify-admins

**الغرض:** إشعار جميع المسؤولين

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('notify-admins', {
  body: {
    title: "تنبيه أمني",
    message: "تم اكتشاف نشاط مشبوه",
    severity: "critical"
  }
});
```

### 5. send-slack-alert

**الغرض:** إرسال تنبيه لقناة Slack

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('send-slack-alert', {
  body: {
    title: "تنبيه النظام",
    message: "حدث خطأ في...",
    severity: "warning"
  }
});
```

---

## 🔧 الصيانة (Maintenance)

### 1. weekly-maintenance

**الغرض:** صيانة أسبوعية للنظام

```typescript
// يتم استدعاؤها تلقائيًا
// تشمل: تنظيف السجلات، تحسين الفهارس، أرشفة البيانات
```

### 2. run-vacuum

**الغرض:** تنظيف قاعدة البيانات

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('run-vacuum', {
  body: {
    tables: ["audit_logs", "notifications"]
  }
});
```

### 3. cleanup-old-files

**الغرض:** حذف الملفات القديمة

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('cleanup-old-files', {
  body: {
    olderThanDays: 90,
    buckets: ["temp", "cache"]
  }
});
```

### 4. scheduled-cleanup

**الغرض:** تنظيف مجدول

```typescript
// يتم استدعاؤها تلقائيًا يوميًا
```

---

## 🔐 الأمان (Security)

### 1. encrypt-file

**الغرض:** تشفير ملف

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('encrypt-file', {
  body: {
    filePath: "documents/sensitive.pdf",
    algorithm: "AES-256"
  }
});
```

### 2. decrypt-file

**الغرض:** فك تشفير ملف

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('decrypt-file', {
  body: {
    filePath: "documents/sensitive.pdf.enc"
  }
});
```

### 3. biometric-auth

**الغرض:** المصادقة البيومترية

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('biometric-auth', {
  body: {
    userId: "uuid",
    biometricData: "..."
  }
});
```

### 4. check-leaked-password

**الغرض:** فحص كلمات المرور المسربة

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('check-leaked-password', {
  body: {
    passwordHash: "sha256hash"
  }
});

// الاستجابة
{
  isLeaked: false,
  occurrences: 0
}
```

---

## 💾 النسخ الاحتياطي (Backup)

### 1. backup-database

**الغرض:** نسخ احتياطي لقاعدة البيانات

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('backup-database', {
  body: {
    includeStorage: true,
    tables: ["all"]
  }
});

// الاستجابة
{
  success: true,
  backupId: "uuid",
  filePath: "backups/2024-01-15.sql",
  fileSize: 1024000
}
```

### 2. restore-database

**الغرض:** استعادة نسخة احتياطية

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('restore-database', {
  body: {
    backupId: "uuid"
  }
});
```

### 3. daily-backup

**الغرض:** نسخ احتياطي يومي تلقائي

```typescript
// يتم استدعاؤها تلقائيًا يوميًا
```

---

## 👤 المستخدمين (Users)

### 1. reset-user-password

**الغرض:** إعادة تعيين كلمة مرور المستخدم

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('reset-user-password', {
  body: {
    userId: "uuid",
    newPassword: "securePassword123"
  }
});
```

### 2. update-user-email

**الغرض:** تحديث بريد المستخدم

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('update-user-email', {
  body: {
    userId: "uuid",
    newEmail: "new@email.com"
  }
});
```

### 3. create-beneficiary-accounts

**الغرض:** إنشاء حسابات للمستفيدين

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('create-beneficiary-accounts', {
  body: {
    beneficiaryIds: ["uuid1", "uuid2"],
    sendCredentials: true
  }
});
```

---

## 📄 OCR والمستندات (Documents)

### 1. ocr-document

**الغرض:** قراءة النص من المستندات

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('ocr-document', {
  body: {
    filePath: "documents/invoice.pdf",
    language: "ar"
  }
});

// الاستجابة
{
  text: "محتوى المستند...",
  confidence: 0.95,
  pages: 2
}
```

### 2. extract-invoice-data

**الغرض:** استخراج بيانات الفاتورة

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('extract-invoice-data', {
  body: {
    filePath: "invoices/inv-001.pdf"
  }
});

// الاستجابة
{
  invoiceNumber: "INV-001",
  date: "2024-01-15",
  amount: 5000,
  vendor: "...",
  items: [...]
}
```

### 3. extract-contract-data

**الغرض:** استخراج بيانات العقد

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('extract-contract-data', {
  body: {
    filePath: "contracts/contract-001.pdf"
  }
});
```

---

## 🗄️ قاعدة البيانات (Database)

### 1. db-health-check

**الغرض:** فحص صحة قاعدة البيانات

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('db-health-check');

// الاستجابة
{
  status: "healthy",
  connectionCount: 15,
  activeQueries: 3,
  cacheHitRatio: 0.95,
  issues: []
}
```

### 2. db-performance-stats

**الغرض:** إحصائيات أداء قاعدة البيانات

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('db-performance-stats');

// الاستجابة
{
  slowQueries: [...],
  tableBloat: [...],
  indexUsage: [...],
  recommendations: [...]
}
```

---

## 🚨 التنبيهات (Alerts)

### 1. generate-smart-alerts

**الغرض:** توليد تنبيهات ذكية

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('generate-smart-alerts');

// الاستجابة
{
  alerts: [
    {
      type: "contract_expiry",
      severity: "warning",
      message: "3 عقود تنتهي خلال 30 يوم"
    }
  ]
}
```

### 2. contract-renewal-alerts

**الغرض:** تنبيهات تجديد العقود

```typescript
// يتم استدعاؤها تلقائيًا أسبوعيًا
```

### 3. support-auto-escalate

**الغرض:** تصعيد تلقائي لتذاكر الدعم

```typescript
// يتم استدعاؤها تلقائيًا
// تصعيد التذاكر التي تجاوزت SLA
```

---

## 📊 التقارير (Reports)

### 1. generate-scheduled-report

**الغرض:** توليد تقرير مجدول

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('generate-scheduled-report', {
  body: {
    reportType: "monthly_financial",
    period: "2024-01"
  }
});
```

### 2. weekly-report

**الغرض:** تقرير أسبوعي

```typescript
// يتم استدعاؤها تلقائيًا أسبوعيًا
```

### 3. generate-distribution-summary

**الغرض:** ملخص التوزيعات

```typescript
// الاستدعاء
const { data } = await supabase.functions.invoke('generate-distribution-summary', {
  body: {
    distributionId: "uuid"
  }
});
```

---

## 🔗 الملفات ذات الصلة

- [قاعدة البيانات](../database/SCHEMA.md)
- [سياسات الأمان](../security/RLS_POLICIES.md)
- [التوثيق الشامل](../COMPLETE_DOCUMENTATION.md)
