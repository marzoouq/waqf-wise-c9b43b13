# استعلامات فحص صحة النظام
> استعلامات SQL جاهزة للفحص الدوري

---

## 📊 1. فحص أداء قاعدة البيانات

### 1.1 Cache Hit Ratio
```sql
SELECT 
  ROUND(
    (SUM(heap_blks_hit) / NULLIF(SUM(heap_blks_hit) + SUM(heap_blks_read), 0)) * 100, 
    2
  ) AS cache_hit_ratio_percentage
FROM pg_statio_user_tables;
```
**الهدف:** > 98% (المثالي: 99%+)

### 1.2 حجم الجداول الكبيرة
```sql
SELECT 
  relname AS table_name,
  pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
  n_live_tup AS row_count
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(relid) DESC
LIMIT 10;
```

### 1.3 الفهارس غير المستخدمة
```sql
SELECT 
  schemaname,
  relname AS table_name,
  indexrelname AS index_name,
  idx_scan AS times_used
FROM pg_stat_user_indexes
WHERE idx_scan < 10
ORDER BY idx_scan;
```

---

## 📋 2. فحص سلامة البيانات

### 2.1 العقود بدون مستأجرين
```sql
SELECT COUNT(*) AS contracts_without_tenants
FROM contracts c
LEFT JOIN tenants t ON c.tenant_id = t.id
WHERE c.status = 'نشط' AND t.id IS NULL;
```
**الهدف:** 0

### 2.2 المستفيدين بدون عائلات
```sql
SELECT COUNT(*) AS beneficiaries_without_families
FROM beneficiaries b
LEFT JOIN families f ON b.family_id = f.id
WHERE b.status = 'نشط' AND b.family_id IS NOT NULL AND f.id IS NULL;
```
**الهدف:** 0

### 2.3 الوحدات بدون عقارات
```sql
SELECT COUNT(*) AS units_without_properties
FROM property_units u
LEFT JOIN properties p ON u.property_id = p.id
WHERE p.id IS NULL;
```
**الهدف:** 0

### 2.4 حالات غير صحيحة
```sql
-- العقود
SELECT status, COUNT(*) FROM contracts 
WHERE status NOT IN ('نشط', 'active', 'منتهي', 'expired', 'ملغي', 'cancelled', 'معلق', 'pending')
GROUP BY status;

-- المستفيدين
SELECT status, COUNT(*) FROM beneficiaries 
WHERE status NOT IN ('نشط', 'active', 'متوقف', 'inactive', 'معلق', 'pending', 'متوفى', 'deceased')
GROUP BY status;

-- المستأجرين
SELECT status, COUNT(*) FROM tenants 
WHERE status NOT IN ('نشط', 'active', 'متوقف', 'inactive', 'معلق', 'pending')
GROUP BY status;
```

---

## ⚠️ 3. فحص التنبيهات

### 3.1 العقود المنتهية خلال 30 يوم
```sql
SELECT 
  id,
  contract_number,
  end_date,
  (end_date - CURRENT_DATE) AS days_remaining
FROM contracts
WHERE status = 'نشط'
  AND end_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY end_date;
```

### 3.2 طلبات الصيانة المتأخرة (> 7 أيام)
```sql
SELECT 
  id,
  title,
  priority,
  status,
  created_at,
  EXTRACT(DAY FROM NOW() - created_at) AS days_open
FROM maintenance_requests
WHERE status IN ('جديد', 'new', 'قيد_التنفيذ', 'in_progress')
  AND created_at < NOW() - INTERVAL '7 days'
ORDER BY created_at;
```

### 3.3 التنبيهات النشطة
```sql
SELECT 
  alert_type,
  severity,
  COUNT(*) AS count
FROM system_alerts
WHERE is_resolved = false
GROUP BY alert_type, severity
ORDER BY 
  CASE severity 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'medium' THEN 3 
    ELSE 4 
  END;
```

---

## 🔴 4. فحص الأخطاء

### 4.1 أخطاء النظام (آخر 7 أيام)
```sql
SELECT 
  severity,
  error_type,
  COUNT(*) AS count
FROM system_error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY severity, error_type
ORDER BY 
  CASE severity 
    WHEN 'critical' THEN 1 
    WHEN 'high' THEN 2 
    WHEN 'medium' THEN 3 
    ELSE 4 
  END,
  count DESC;
```

### 4.2 تفاصيل الأخطاء الحرجة
```sql
SELECT 
  id,
  error_type,
  error_message,
  stack_trace,
  created_at
FROM system_error_logs
WHERE severity IN ('critical', 'high')
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;
```

---

## 👥 5. فحص المستخدمين والصلاحيات

### 5.1 توزيع الأدوار
```sql
SELECT 
  role,
  COUNT(*) AS user_count
FROM user_roles
GROUP BY role
ORDER BY user_count DESC;
```

### 5.2 المستخدمين بدون أدوار
```sql
SELECT p.id, p.full_name, p.email
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.id IS NULL;
```

### 5.3 نشاط المستخدمين (آخر 30 يوم)
```sql
SELECT 
  user_email,
  action_type,
  COUNT(*) AS action_count
FROM audit_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY user_email, action_type
ORDER BY action_count DESC
LIMIT 20;
```

---

## 💾 6. فحص النسخ الاحتياطي

### 6.1 آخر نسخة احتياطية
```sql
SELECT 
  id,
  backup_type,
  status,
  file_size,
  started_at,
  completed_at,
  EXTRACT(EPOCH FROM (completed_at - started_at)) AS duration_seconds
FROM backup_logs
ORDER BY created_at DESC
LIMIT 5;
```

### 6.2 إحصائيات النسخ الاحتياطي
```sql
SELECT 
  backup_type,
  status,
  COUNT(*) AS count,
  AVG(file_size) AS avg_size
FROM backup_logs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY backup_type, status;
```

---

## 📦 7. أرشفة السجلات

### 7.1 عدد سجلات audit_logs
```sql
SELECT 
  COUNT(*) AS total_records,
  pg_size_pretty(pg_total_relation_size('audit_logs')) AS table_size
FROM audit_logs;
```

### 7.2 تشغيل الأرشفة (إذا تجاوز 10,000)
```sql
-- أرشفة السجلات الأقدم من 3 أشهر
SELECT archive_old_audit_logs(3);
```

### 7.3 التحقق من الأرشيف
```sql
SELECT 
  COUNT(*) AS archived_records,
  pg_size_pretty(pg_total_relation_size('audit_logs_archive')) AS archive_size
FROM audit_logs_archive;
```

---

## 📈 8. إحصائيات عامة

### 8.1 ملخص النظام
```sql
SELECT 
  (SELECT COUNT(*) FROM properties) AS properties_count,
  (SELECT COUNT(*) FROM property_units) AS units_count,
  (SELECT COUNT(*) FROM contracts WHERE status = 'نشط') AS active_contracts,
  (SELECT COUNT(*) FROM tenants WHERE status IN ('نشط', 'active')) AS active_tenants,
  (SELECT COUNT(*) FROM beneficiaries WHERE status = 'نشط') AS active_beneficiaries,
  (SELECT COUNT(*) FROM families) AS families_count,
  (SELECT COUNT(*) FROM maintenance_requests WHERE status IN ('جديد', 'new', 'قيد_التنفيذ', 'in_progress')) AS open_maintenance,
  (SELECT COALESCE(SUM(amount), 0) FROM payment_vouchers WHERE type = 'receipt' AND status = 'paid') AS total_collection;
```

### 8.2 نشاط اليوم
```sql
SELECT 
  action_type,
  COUNT(*) AS count
FROM audit_logs
WHERE created_at > CURRENT_DATE
GROUP BY action_type
ORDER BY count DESC;
```

---

## 🔧 ملاحظات الاستخدام

1. **الفحص اليومي:** استعلامات 3.1, 3.2, 4.1
2. **الفحص الأسبوعي:** استعلامات 1.1, 2.x, 5.x
3. **الفحص الشهري:** جميع الاستعلامات
4. **عند الحاجة:** استعلام 7.2 للأرشفة

---

## 📅 آخر تحديث
- **التاريخ:** 2026-01-17
- **الإصدار:** 1.0.0
