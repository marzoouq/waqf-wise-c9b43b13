
-- تحديث دالة إنشاء الموافقات التلقائية لتطابق هيكل الجدول الصحيح
CREATE OR REPLACE FUNCTION auto_create_distribution_approvals()
RETURNS TRIGGER AS $$
BEGIN
  -- مستوى 1: محاسب
  INSERT INTO distribution_approvals (
    distribution_id,
    level,
    approval_level,
    approver_name,
    status
  ) VALUES (
    NEW.id,
    1,
    1,
    'محاسب',
    'pending'
  );

  -- مستوى 2: مدير  
  INSERT INTO distribution_approvals (
    distribution_id,
    level,
    approval_level,
    approver_name,
    status
  ) VALUES (
    NEW.id,
    2,
    2,
    'مدير',
    'pending'
  );

  -- مستوى 3: ناظر
  INSERT INTO distribution_approvals (
    distribution_id,
    level,
    approval_level,
    approver_name,
    status
  ) VALUES (
    NEW.id,
    3,
    3,
    'ناظر',
    'pending'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إعادة إنشاء Trigger
DROP TRIGGER IF EXISTS trigger_auto_create_approvals ON distributions;
CREATE TRIGGER trigger_auto_create_approvals
  AFTER INSERT ON distributions
  FOR EACH ROW
  WHEN (NEW.status = 'قيد الإعتماد' OR NEW.status = 'pending')
  EXECUTE FUNCTION auto_create_distribution_approvals();
