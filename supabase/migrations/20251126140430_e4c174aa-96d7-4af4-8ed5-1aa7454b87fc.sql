-- المرحلة 3: إصلاح سياسات RLS لـ governance_votes
-- حذف السياسات القديمة وإنشاء سياسات صحيحة

DROP POLICY IF EXISTS "Enable read access for all users" ON governance_votes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON governance_votes;

-- إنشاء سياسات جديدة محسنة
CREATE POLICY "Users can view all votes"
  ON governance_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert votes"
  ON governance_votes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- المرحلة 4: إصلاح Foreign Key في beneficiary_activity_log
-- إضافة ON DELETE CASCADE للسماح بحذف السجلات عند حذف المستفيد

ALTER TABLE beneficiary_activity_log
  DROP CONSTRAINT IF EXISTS beneficiary_activity_log_beneficiary_id_fkey;

ALTER TABLE beneficiary_activity_log
  ADD CONSTRAINT beneficiary_activity_log_beneficiary_id_fkey
  FOREIGN KEY (beneficiary_id)
  REFERENCES beneficiaries(id)
  ON DELETE CASCADE;

-- المرحلة 5: تنظيف الأخطاء القديمة
-- تحديث حالة الأخطاء القديمة (أكثر من 30 يوم) إلى resolved
UPDATE system_error_logs
SET status = 'resolved'
WHERE status = 'new'
  AND created_at < NOW() - INTERVAL '30 days';

-- حذف أخطاء "[object Object]" القديمة
DELETE FROM system_error_logs
WHERE error_message = '[object Object]'
  AND created_at < NOW() - INTERVAL '7 days';

-- حذف أخطاء callback القديمة
DELETE FROM system_error_logs
WHERE error_message LIKE '%The provided callback is no longer runnable%'
  AND created_at < NOW() - INTERVAL '7 days';