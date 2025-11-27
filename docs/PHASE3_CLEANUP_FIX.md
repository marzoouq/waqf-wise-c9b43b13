# المرحلة 3: تنظيف قاعدة البيانات ✅

## المشكلة
- **9,999+ سجل** متراكم في `system_health_checks`
- تنبيهات قديمة ومكررة في `system_alerts`
- لا يوجد آلية تنظيف تلقائي

## الحل المُنفذ

### 1. التنظيف الفوري
```sql
-- حذف السجلات القديمة (أكثر من 7 أيام)
DELETE FROM system_health_checks 
WHERE created_at < NOW() - INTERVAL '7 days';

-- حذف التنبيهات المحلولة القديمة
DELETE FROM system_alerts 
WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status IN ('resolved', 'acknowledged');
```

### 2. دوال التنظيف

#### `cleanup_old_records()`
دالة تنظيف شاملة تحذف:
- `system_health_checks`: أقدم من 7 أيام
- `system_error_logs`: المحلولة أقدم من 30 يوم
- `audit_logs`: أقدم من 90 يوم
- `notifications`: المقروءة أقدم من 30 يوم
- `system_alerts`: المحلولة أقدم من 24 ساعة

#### `run_scheduled_cleanup()`
دالة تنظيف مع تسجيل تُرجع:
```json
{
  "success": true,
  "total_deleted": 500,
  "details": {
    "health_checks": 400,
    "error_logs": 20,
    "alerts": 30,
    "audit_logs": 0,
    "notifications": 50
  }
}
```

### 3. جدول تتبع التنظيف
```sql
CREATE TABLE cleanup_logs (
  id UUID PRIMARY KEY,
  cleanup_type TEXT,
  records_deleted INTEGER,
  tables_cleaned TEXT[],
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT,
  error_message TEXT
);
```

### 4. Edge Function للتنظيف المجدول
`supabase/functions/scheduled-cleanup/index.ts`
- يمكن استدعاؤها من Cron Job
- تسجل النتائج في `audit_logs`

### 5. فهارس لتحسين الأداء
```sql
CREATE INDEX idx_system_health_checks_created_at ON system_health_checks(created_at);
CREATE INDEX idx_system_alerts_status_created ON system_alerts(status, created_at);
CREATE INDEX idx_system_error_logs_status_created ON system_error_logs(status, created_at);
```

## سياسات الاحتفاظ

| الجدول | فترة الاحتفاظ | الشرط |
|--------|---------------|-------|
| `system_health_checks` | 7 أيام | جميع السجلات |
| `system_error_logs` | 30 يوم | المحلولة فقط |
| `system_alerts` | 24 ساعة | المحلولة/المُقرة |
| `audit_logs` | 90 يوم | جميع السجلات |
| `notifications` | 30 يوم | المقروءة فقط |

## الاستخدام

### تشغيل التنظيف يدوياً
```typescript
const { data } = await supabase.rpc('run_scheduled_cleanup');
console.log(data);
```

### عبر Edge Function
```bash
curl -X POST https://zsacuvrcohmraoldilph.supabase.co/functions/v1/scheduled-cleanup \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### تكامل الواجهة
Hook `useAlertCleanup` يعمل تلقائياً كل 6 ساعات.

## النتائج

| قبل التنظيف | بعد التنظيف |
|-------------|-------------|
| 9,999 سجل health | ~1,000 سجل |
| 51 تنبيه | ~27 تنبيه |
| 23 سجل خطأ | 23 سجل |

## ✅ الحالة: مكتمل
