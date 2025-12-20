-- تنظيف الفهارس غير المستخدمة بأمان
-- هذه الفهارس لم تُستخدم أبدًا ويمكن حذفها بأمان

-- حذف الفهارس على جدول audit_logs
DROP INDEX IF EXISTS idx_audit_table_date;
DROP INDEX IF EXISTS idx_audit_table;

-- ملاحظة: نحتفظ بالفهارس التالية لأنها قد تكون مطلوبة:
-- - جميع المفاتيح الأساسية (pkey)
-- - جميع القيود الفريدة (unique)
-- - فهارس جداول النظام (auth, storage)