-- إصلاح سياسات RLS لجدول system_health_checks (نسخة مبسطة)

-- حذف السياسة القديمة
DROP POLICY IF EXISTS "Everyone can view system health checks" ON system_health_checks;

-- إنشاء سياسات جديدة
-- 1. المستخدمون المصادق عليهم يمكنهم عرض جميع فحوصات الصحة
CREATE POLICY "Authenticated users can view health checks"
  ON system_health_checks
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. السماح بإدخال فحوصات الصحة (مبسط - بدون فحص الأدوار)
CREATE POLICY "System can insert health checks"
  ON system_health_checks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 3. السماح بالتحديث والحذف للمستخدمين المصادق عليهم
CREATE POLICY "Authenticated users can update health checks"
  ON system_health_checks
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete health checks"
  ON system_health_checks
  FOR DELETE
  TO authenticated
  USING (true);

-- تحسين الأداء: إضافة فهارس
CREATE INDEX IF NOT EXISTS idx_health_checks_created_at 
  ON system_health_checks(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_health_checks_status 
  ON system_health_checks(status);