-- ==========================================
-- المرحلة 2: التكامل - Workflows + Notifications
-- ==========================================

-- 1. جدول workflows للطلبات
CREATE TABLE IF NOT EXISTS request_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES beneficiary_requests(id) ON DELETE CASCADE,
  current_step INT NOT NULL DEFAULT 1,
  total_steps INT NOT NULL DEFAULT 3,
  assigned_to UUID,
  assigned_at TIMESTAMPTZ,
  sla_due_at TIMESTAMPTZ,
  escalated BOOLEAN DEFAULT FALSE,
  escalated_at TIMESTAMPTZ,
  escalation_level INT DEFAULT 0,
  workflow_status TEXT DEFAULT 'active' CHECK (workflow_status IN ('active', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_request_workflows_request_id ON request_workflows(request_id);
CREATE INDEX idx_request_workflows_assigned_to ON request_workflows(assigned_to);
CREATE INDEX idx_request_workflows_status ON request_workflows(workflow_status);
CREATE INDEX idx_request_workflows_sla ON request_workflows(sla_due_at) WHERE workflow_status = 'active';

-- 2. Function للتعيين التلقائي للطلبات
CREATE OR REPLACE FUNCTION auto_assign_request_workflow()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_assigned_user UUID;
  v_sla_hours INT := 48; -- 48 ساعة افتراضياً
BEGIN
  -- الحصول على SLA من نوع الطلب
  SELECT sla_hours INTO v_sla_hours
  FROM request_types
  WHERE id = NEW.request_type_id;

  -- التعيين التلقائي (يمكن تحسينه لاحقاً بناءً على الحمل)
  -- حالياً: نختار أول موظف متاح
  SELECT user_id INTO v_assigned_user
  FROM user_roles
  WHERE role IN ('admin', 'staff', 'supervisor')
  LIMIT 1;

  -- إنشاء workflow
  INSERT INTO request_workflows (
    request_id,
    current_step,
    total_steps,
    assigned_to,
    assigned_at,
    sla_due_at
  ) VALUES (
    NEW.id,
    1,
    3,
    v_assigned_user,
    now(),
    now() + (v_sla_hours || ' hours')::INTERVAL
  );

  -- تحديث الطلب
  UPDATE beneficiary_requests
  SET 
    assigned_to = v_assigned_user,
    assigned_at = now(),
    sla_due_at = now() + (v_sla_hours || ' hours')::INTERVAL
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$;

-- Trigger للتعيين التلقائي
DROP TRIGGER IF EXISTS trigger_auto_assign_request ON beneficiary_requests;
CREATE TRIGGER trigger_auto_assign_request
AFTER INSERT ON beneficiary_requests
FOR EACH ROW
EXECUTE FUNCTION auto_assign_request_workflow();

-- 3. Function للتصعيد التلقائي للطلبات المتأخرة
CREATE OR REPLACE FUNCTION escalate_overdue_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request RECORD;
  v_supervisor UUID;
BEGIN
  -- البحث عن الطلبات المتأخرة
  FOR v_request IN
    SELECT rw.*, br.beneficiary_id, br.request_type_id
    FROM request_workflows rw
    JOIN beneficiary_requests br ON br.id = rw.request_id
    WHERE rw.workflow_status = 'active'
      AND rw.sla_due_at < now()
      AND rw.escalated = FALSE
  LOOP
    -- الحصول على مشرف للتصعيد
    SELECT user_id INTO v_supervisor
    FROM user_roles
    WHERE role IN ('supervisor', 'admin')
    LIMIT 1;

    -- تحديث workflow
    UPDATE request_workflows
    SET 
      escalated = TRUE,
      escalated_at = now(),
      escalation_level = escalation_level + 1,
      assigned_to = v_supervisor,
      assigned_at = now()
    WHERE id = v_request.id;

    -- تحديث الطلب
    UPDATE beneficiary_requests
    SET assigned_to = v_supervisor
    WHERE id = v_request.request_id;

    -- إنشاء إشعار للمشرف
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      priority,
      reference_type,
      reference_id,
      action_url
    ) VALUES (
      v_supervisor,
      'تصعيد طلب متأخر',
      'تم تصعيد طلب رقم ' || (SELECT request_number FROM beneficiary_requests WHERE id = v_request.request_id),
      'warning',
      'high',
      'request',
      v_request.request_id,
      '/staff/requests'
    );
  END LOOP;
END;
$$;

-- 4. إشعارات تلقائية للقروض
CREATE OR REPLACE FUNCTION send_loan_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- عند الموافقة على القرض
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      priority,
      reference_type,
      reference_id,
      action_url
    )
    SELECT
      b.user_id,
      'تمت الموافقة على القرض',
      'تمت الموافقة على طلب القرض رقم ' || NEW.loan_number || ' بمبلغ ' || NEW.loan_amount || ' ر.س',
      'success',
      'medium',
      'loan',
      NEW.id,
      '/beneficiary/loans'
    FROM beneficiaries b
    WHERE b.id = NEW.beneficiary_id AND b.user_id IS NOT NULL;
  END IF;

  -- عند رفض القرض
  IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      priority,
      reference_type,
      reference_id,
      action_url
    )
    SELECT
      b.user_id,
      'تم رفض القرض',
      'تم رفض طلب القرض رقم ' || NEW.loan_number,
      'error',
      'medium',
      'loan',
      NEW.id,
      '/beneficiary/loans'
    FROM beneficiaries b
    WHERE b.id = NEW.beneficiary_id AND b.user_id IS NOT NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_loan_notifications ON loans;
CREATE TRIGGER trigger_loan_notifications
AFTER UPDATE ON loans
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION send_loan_notifications();

-- 5. إشعارات للطلبات
CREATE OR REPLACE FUNCTION send_request_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- عند الموافقة
  IF NEW.status = 'موافق عليه' AND OLD.status != 'موافق عليه' THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      priority,
      reference_type,
      reference_id,
      action_url
    )
    SELECT
      b.user_id,
      'تمت الموافقة على الطلب',
      'تمت الموافقة على طلبك رقم ' || NEW.request_number,
      'success',
      'medium',
      'request',
      NEW.id,
      '/beneficiary/requests'
    FROM beneficiaries b
    WHERE b.id = NEW.beneficiary_id AND b.user_id IS NOT NULL;
  END IF;

  -- عند الرفض
  IF NEW.status = 'مرفوض' AND OLD.status != 'مرفوض' THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      type,
      priority,
      reference_type,
      reference_id,
      action_url
    )
    SELECT
      b.user_id,
      'تم رفض الطلب',
      'تم رفض طلبك رقم ' || NEW.request_number || COALESCE(': ' || NEW.rejection_reason, ''),
      'error',
      'medium',
      'request',
      NEW.id,
      '/beneficiary/requests'
    FROM beneficiaries b
    WHERE b.id = NEW.beneficiary_id AND b.user_id IS NOT NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_request_notifications ON beneficiary_requests;
CREATE TRIGGER trigger_request_notifications
AFTER UPDATE ON beneficiary_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION send_request_notifications();

-- 6. إشعارات استحقاق الدفعات
CREATE OR REPLACE FUNCTION notify_payment_due()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
BEGIN
  -- البحث عن دفعات قادمة خلال 3 أيام
  FOR v_payment IN
    SELECT rp.*, c.tenant_name, c.tenant_email, p.name as property_name
    FROM rental_payments rp
    JOIN contracts c ON c.id = rp.contract_id
    JOIN properties p ON p.id = c.property_id
    WHERE rp.status = 'معلق'
      AND rp.due_date BETWEEN now() AND now() + INTERVAL '3 days'
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.reference_id = rp.id
          AND n.reference_type = 'rental_payment'
          AND n.created_at > now() - INTERVAL '7 days'
      )
  LOOP
    -- إرسال إشعار للمستأجر (إذا كان لديه حساب)
    -- يمكن توسيعه لاحقاً لإرسال بريد إلكتروني
    NULL;
  END LOOP;
END;
$$;