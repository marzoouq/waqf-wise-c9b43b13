-- إنشاء دالة create_notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_title TEXT,
  p_message TEXT,
  p_type TEXT DEFAULT 'info',
  p_reference_type TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_action_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, title, message, type, reference_type, 
    reference_id, action_url, is_read
  ) VALUES (
    p_user_id, p_title, p_message, p_type, p_reference_type,
    p_reference_id, p_action_url, false
  ) RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- إنشاء دالة notify_rental_payment_due
CREATE OR REPLACE FUNCTION public.notify_rental_payment_due()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment RECORD;
  v_admin RECORD;
BEGIN
  FOR v_payment IN
    SELECT rp.id, rp.payment_number, rp.amount_due, rp.due_date,
           c.tenant_name, p.name as property_name,
           (CURRENT_DATE - rp.due_date) as days_overdue
    FROM rental_payments rp
    JOIN contracts c ON c.id = rp.contract_id
    JOIN properties p ON p.id = c.property_id
    WHERE rp.status IN ('معلق', 'متأخر')
      AND rp.due_date <= CURRENT_DATE + 7
  LOOP
    FOR v_admin IN 
      SELECT DISTINCT pr.user_id
      FROM profiles pr
      JOIN user_roles ur ON ur.user_id = pr.user_id
      WHERE ur.role = 'admin' AND pr.is_active = true
    LOOP
      PERFORM create_notification(
        v_admin.user_id,
        CASE WHEN v_payment.days_overdue > 0 THEN 'دفعة متأخرة' ELSE 'دفعة مستحقة' END,
        'دفعة ' || v_payment.payment_number || ' - ' || v_payment.tenant_name,
        CASE WHEN v_payment.days_overdue > 0 THEN 'error' ELSE 'warning' END,
        'rental_payment',
        v_payment.id,
        '/properties?tab=payments'
      );
    END LOOP;
  END LOOP;
END;
$$;

-- إنشاء دالة notify_contract_expiring
CREATE OR REPLACE FUNCTION public.notify_contract_expiring()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract RECORD;
  v_admin RECORD;
BEGIN
  FOR v_contract IN
    SELECT c.id, c.contract_number, c.tenant_name, c.end_date,
           p.name as property_name,
           (c.end_date - CURRENT_DATE) as days_remaining
    FROM contracts c
    JOIN properties p ON p.id = c.property_id
    WHERE c.status = 'نشط'
      AND c.end_date <= CURRENT_DATE + 30
  LOOP
    FOR v_admin IN 
      SELECT DISTINCT pr.user_id
      FROM profiles pr
      JOIN user_roles ur ON ur.user_id = pr.user_id
      WHERE ur.role = 'admin' AND pr.is_active = true
    LOOP
      PERFORM create_notification(
        v_admin.user_id,
        CASE WHEN v_contract.days_remaining < 0 THEN 'عقد منتهي' ELSE 'عقد قارب الانتهاء' END,
        'عقد ' || v_contract.contract_number || ' - ' || v_contract.tenant_name,
        CASE WHEN v_contract.days_remaining < 0 THEN 'error' ELSE 'warning' END,
        'contract',
        v_contract.id,
        '/properties?tab=contracts'
      );
    END LOOP;
  END LOOP;
END;
$$;