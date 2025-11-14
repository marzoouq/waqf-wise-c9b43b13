-- إضافة حقل is_dismissed لجدول smart_alerts إذا لم يكن موجوداً
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'smart_alerts' AND column_name = 'is_dismissed'
  ) THEN
    ALTER TABLE smart_alerts ADD COLUMN is_dismissed BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Index للرؤى النشطة
DROP INDEX IF EXISTS idx_smart_alerts_active;
CREATE INDEX idx_smart_alerts_active ON smart_alerts(is_dismissed, created_at DESC) WHERE is_dismissed = false;

-- تحديث RLS policies لـ smart_alerts للسماح بالتعديل
DROP POLICY IF EXISTS "Nazer and Admin can update alerts" ON smart_alerts;

CREATE POLICY "Nazer and Admin can update alerts"
  ON smart_alerts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('nazer', 'admin')
    )
  );