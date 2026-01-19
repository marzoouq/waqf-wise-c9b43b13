-- ============================================
-- المرحلة 3: منع تكرار الإشعارات مستقبلاً
-- ============================================

-- إنشاء دالة immutable لاستخراج التاريخ
CREATE OR REPLACE FUNCTION extract_date_immutable(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT ts::date;
$$;

-- إضافة partial unique index لمنع تكرار الإشعارات غير المقروءة
CREATE UNIQUE INDEX IF NOT EXISTS notifications_unique_unread_per_day 
ON notifications (user_id, type, title, extract_date_immutable(created_at))
WHERE is_read = false;