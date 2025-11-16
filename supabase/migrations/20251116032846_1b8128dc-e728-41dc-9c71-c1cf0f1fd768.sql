-- إصلاح جميع الدوال بإضافة search_path للأمان

-- دوال التحديث
CREATE OR REPLACE FUNCTION public.update_system_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.update_custom_reports_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- دوال الإشعارات
CREATE OR REPLACE FUNCTION public.notify_rental_payment_due()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.notify_contract_expiring()
RETURNS void AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- دوال التحديث التلقائي
CREATE OR REPLACE FUNCTION public.check_overdue_requests()
RETURNS void AS $$
BEGIN
  UPDATE beneficiary_requests br
  SET is_overdue = true,
      updated_at = now()
  WHERE br.status IN ('قيد المراجعة', 'قيد المعالجة')
    AND br.is_overdue = false
    AND br.sla_due_at IS NOT NULL
    AND br.sla_due_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.update_overdue_installments()
RETURNS void AS $$
BEGIN
  UPDATE loan_installments
  SET status = 'overdue'
  WHERE due_date < CURRENT_DATE
  AND status IN ('pending', 'partial');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.generate_smart_insights()
RETURNS void AS $$
DECLARE
  v_overdue_loans INTEGER;
  v_expiring_contracts INTEGER;
  v_pending_requests INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_overdue_loans FROM loans WHERE status = 'defaulted';
  
  IF v_overdue_loans > 5 THEN
    INSERT INTO smart_alerts (alert_type, severity, title, description, action_url, data)
    VALUES (
      'anomaly', 'critical', 'تنبيه: زيادة في القروض المتأخرة',
      format('يوجد %s قرض متأخر. يُنصح بمتابعة المستفيدين وتفعيل خطط السداد.', v_overdue_loans),
      '/loans', jsonb_build_object('count', v_overdue_loans, 'type', 'overdue_loans')
    );
  END IF;
  
  SELECT COUNT(*) INTO v_expiring_contracts
  FROM contracts WHERE status = 'نشط' AND end_date <= CURRENT_DATE + INTERVAL '30 days';
  
  IF v_expiring_contracts > 0 THEN
    INSERT INTO smart_alerts (alert_type, severity, title, description, action_url, data)
    VALUES (
      'recommendation', 'warning', format('توصية: %s عقد قارب على الانتهاء', v_expiring_contracts),
      'يُنصح بالتواصل مع المستأجرين لتجديد العقود أو البحث عن مستأجرين جدد.',
      '/properties?tab=contracts', jsonb_build_object('count', v_expiring_contracts, 'type', 'expiring_contracts')
    );
  END IF;
  
  SELECT COUNT(*) INTO v_pending_requests
  FROM beneficiary_requests WHERE status = 'قيد المراجعة' AND submitted_at < now() - INTERVAL '7 days';
  
  IF v_pending_requests > 0 THEN
    INSERT INTO smart_alerts (alert_type, severity, title, description, action_url, data)
    VALUES (
      'anomaly', 'warning', format('تنبيه: %s طلب معلق منذ أكثر من أسبوع', v_pending_requests),
      'هناك طلبات تحتاج إلى مراجعة عاجلة لتحسين وقت الاستجابة.',
      '/requests', jsonb_build_object('count', v_pending_requests, 'type', 'pending_requests')
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;