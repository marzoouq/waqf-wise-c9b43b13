-- ========================================
-- المرحلة 1: إصلاح RLS لـ governance_votes
-- ========================================

DROP POLICY IF EXISTS "governance_votes_insert_policy" ON governance_votes;

CREATE POLICY "governance_votes_insert_policy" ON governance_votes
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND voter_id = auth.uid()
);

-- ========================================
-- المرحلة 2: إضافة Trigger للتحقق من beneficiary_id
-- ========================================

CREATE OR REPLACE FUNCTION validate_beneficiary_activity_log()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM beneficiaries WHERE id = NEW.beneficiary_id
  ) THEN
    RAISE EXCEPTION 'المستفيد غير موجود: %', NEW.beneficiary_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp';

DROP TRIGGER IF EXISTS validate_beneficiary_before_activity_log ON beneficiary_activity_log;

CREATE TRIGGER validate_beneficiary_before_activity_log
BEFORE INSERT ON beneficiary_activity_log
FOR EACH ROW
EXECUTE FUNCTION validate_beneficiary_activity_log();

-- ========================================
-- المرحلة 3: تنظيف التنبيهات القديمة
-- ========================================

DELETE FROM system_alerts 
WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status IN ('resolved', 'acknowledged');

-- تحديث التنبيهات المتعلقة بـ useAuth
UPDATE system_alerts 
SET status = 'resolved',
    resolved_at = NOW()
WHERE description LIKE '%useAuth must be used%'
  AND status != 'resolved';

DELETE FROM system_error_logs 
WHERE created_at < NOW() - INTERVAL '7 days'
  AND status = 'resolved';

-- ========================================
-- المرحلة 4: نظام تنظيف تلقائي
-- ========================================

CREATE OR REPLACE FUNCTION cleanup_old_alerts()
RETURNS void AS $$
BEGIN
  DELETE FROM system_alerts 
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND status IN ('resolved', 'acknowledged');
  
  WITH duplicates AS (
    SELECT 
      MIN(id) as keep_id,
      alert_type,
      severity,
      description
    FROM system_alerts
    WHERE status = 'active'
    GROUP BY alert_type, severity, description
    HAVING COUNT(*) > 1
  )
  DELETE FROM system_alerts
  WHERE id NOT IN (SELECT keep_id FROM duplicates)
    AND (alert_type, severity, description) IN (
      SELECT alert_type, severity, description FROM duplicates
    );
  
  DELETE FROM system_alerts
  WHERE id IN (
    SELECT id FROM system_alerts
    WHERE status = 'active'
    ORDER BY created_at DESC
    OFFSET 100
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public', 'pg_temp';

-- ========================================
-- المرحلة 5: تحسين RLS لـ beneficiary_activity_log
-- ========================================

DROP POLICY IF EXISTS "beneficiary_activity_log_insert_policy" ON beneficiary_activity_log;

CREATE POLICY "beneficiary_activity_log_insert_policy" ON beneficiary_activity_log
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM beneficiaries WHERE id = beneficiary_activity_log.beneficiary_id)
  AND (
    is_staff() OR
    auth.uid() IN (SELECT user_id FROM beneficiaries WHERE id = beneficiary_activity_log.beneficiary_id)
  )
);