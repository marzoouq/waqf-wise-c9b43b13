# دليل تنظيف قاعدة البيانات

## نظرة عامة

تم تنفيذ نظام تنظيف تلقائي للحفاظ على أداء قاعدة البيانات وتقليل حجم التخزين.

## الدوال المتاحة

### 1. `cleanup_old_health_checks()`

تنظف سجلات فحص صحة النظام الأقدم من 24 ساعة.

```sql
SELECT cleanup_old_health_checks();
-- يُرجع: عدد السجلات المحذوفة
```

### 2. `run_scheduled_cleanup()`

دالة التنظيف الشامل التي تحذف:

| الجدول | فترة الاحتفاظ |
|--------|---------------|
| `system_health_checks` | 24 ساعة |
| `system_error_logs` | 7 أيام |
| `system_alerts` (resolved) | 30 يوم |
| `audit_logs` (info) | 90 يوم |
| `notifications` (read) | 30 يوم |

```sql
SELECT run_scheduled_cleanup();
-- يُرجع: JSON مع تفاصيل الحذف
```

## Edge Function للتنظيف المجدول

يمكن استدعاء Edge Function من Cron Job أو يدوياً:

```bash
# استدعاء يدوي
curl -X POST https://[PROJECT_ID].supabase.co/functions/v1/scheduled-cleanup \
  -H "Authorization: Bearer [SERVICE_ROLE_KEY]" \
  -H "x-cron-job: true"
```

## إعداد Cron Job (اختياري)

لتشغيل التنظيف تلقائياً كل يوم:

```sql
-- يتطلب pg_cron extension
SELECT cron.schedule(
  'daily-cleanup',
  '0 3 * * *',  -- كل يوم الساعة 3 صباحاً
  'SELECT run_scheduled_cleanup()'
);
```

## نتائج التنظيف الأخير

**تاريخ التنفيذ:** 2025-11-27

| الجدول | قبل | بعد | المحذوف |
|--------|-----|-----|---------|
| `system_health_checks` | 3,786 | 653 | 3,133 (83%) |

## أفضل الممارسات

1. **التنظيف اليومي**: تشغيل `cleanup_old_health_checks()` يومياً
2. **التنظيف الأسبوعي**: تشغيل `run_scheduled_cleanup()` أسبوعياً
3. **المراقبة**: مراجعة `audit_logs` للتأكد من نجاح التنظيف
4. **النسخ الاحتياطي**: أخذ نسخة احتياطية قبل أي تنظيف يدوي كبير

## الصيانة الدورية

```sql
-- فحص حجم الجداول
SELECT 
  relname as table_name,
  pg_size_pretty(pg_total_relation_size(relid)) as total_size,
  n_live_tup as row_count
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;
```

---

*آخر تحديث: 2025-11-27*
