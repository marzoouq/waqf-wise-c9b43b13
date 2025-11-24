
-- إصلاح trigger الـ workflow لاستخدام الأدوار الصحيحة
CREATE OR REPLACE FUNCTION auto_assign_request_workflow()
RETURNS TRIGGER AS $$
DECLARE
  v_assigned_to UUID;
  v_sla_hours INT;
BEGIN
  -- الحصول على SLA من نوع الطلب
  SELECT sla_hours INTO v_sla_hours
  FROM request_types
  WHERE id = NEW.request_type_id;

  -- تعيين الطلب لأول موظف متاح (admin أو accountant)
  SELECT user_id INTO v_assigned_to
  FROM user_roles
  WHERE role IN ('admin', 'accountant', 'nazer')
  LIMIT 1;

  -- إنشاء workflow
  INSERT INTO request_workflows (
    request_id,
    current_step,
    assigned_to,
    workflow_status,
    sla_due_at
  ) VALUES (
    NEW.id,
    1,
    v_assigned_to,
    'active',
    NOW() + (COALESCE(v_sla_hours, 24) || ' hours')::INTERVAL
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
