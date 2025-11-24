-- المرحلة 6.1: إصلاح البيانات الحرجة
UPDATE contracts SET status = 'منتهي', updated_at = NOW()
WHERE end_date < CURRENT_DATE AND status = 'نشط';

UPDATE property_units SET occupancy_status = 'شاغر', current_contract_id = NULL, updated_at = NOW()
WHERE id IN (
  SELECT pu.id FROM property_units pu
  INNER JOIN contract_units cu ON cu.property_unit_id = pu.id
  INNER JOIN contracts c ON c.id = cu.contract_id
  WHERE c.status = 'منتهي'
);

CREATE OR REPLACE FUNCTION auto_update_expired_contracts()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE contracts SET status = 'منتهي', updated_at = NOW()
  WHERE end_date < CURRENT_DATE AND status = 'نشط';
  UPDATE property_units SET occupancy_status = 'شاغر', current_contract_id = NULL, updated_at = NOW()
  WHERE id IN (
    SELECT pu.id FROM property_units pu
    INNER JOIN contract_units cu ON cu.property_unit_id = pu.id
    INNER JOIN contracts c ON c.id = cu.contract_id
    WHERE c.status = 'منتهي' AND c.end_date < CURRENT_DATE
  );
END;
$$;

-- المرحلة 6.2: جداول الصيانة
INSERT INTO maintenance_schedules (
  property_id, schedule_name, maintenance_type, category, frequency,
  next_maintenance_date, last_maintenance_date, estimated_cost,
  assigned_contractor, priority, description, is_active
)
SELECT p.id, 'صيانة دورية - ' || p.name, sd.mt, sd.cat, sd.freq,
       CURRENT_DATE + sd.ni, CURRENT_DATE - INTERVAL '30 days', sd.cost,
       sd.contractor, sd.priority, sd.descr, true
FROM properties p
CROSS JOIN (
  VALUES 
    ('وقائية', 'كهرباء', 'شهري', INTERVAL '15 days', 800, 'متوسط', 'فحص دوري للمكيفات والتهوية', 'شركة الأمانة للكهرباء'),
    ('وقائية', 'سباكة', 'ربع سنوي', INTERVAL '45 days', 1200, 'متوسط', 'فحص أنظمة السباكة والصرف الصحي', 'مؤسسة النجاح للسباكة'),
    ('إصلاحية', 'إنشائية', 'نصف سنوي', INTERVAL '90 days', 3000, 'عالي', 'فحص المباني والهياكل الإنشائية', 'شركة البناء الحديث'),
    ('وقائية', 'نظافة', 'شهري', INTERVAL '10 days', 500, 'منخفض', 'تنظيف الخزانات والمرافق العامة', 'مؤسسة النظافة المتقدمة'),
    ('وقائية', 'أمن وسلامة', 'ربع سنوي', INTERVAL '60 days', 1500, 'عالي', 'فحص أنظمة الحريق والإنذار', 'شركة الحماية للأمن')
) AS sd(mt, cat, freq, ni, cost, priority, descr, contractor)
WHERE p.status = 'نشط' LIMIT 15;

-- المرحلة 6.3: مزودي الصيانة
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM maintenance_providers WHERE provider_name = 'شركة الأمانة للكهرباء والتكييف') THEN
    INSERT INTO maintenance_providers (provider_name, contact_person, phone, email, address, specialization, rating, total_jobs, is_active, notes) VALUES 
      ('شركة الأمانة للكهرباء والتكييف', 'أحمد محمد الأحمد', '+966501234567', 'info@amana-electric.sa', 'الرياض - حي الملز', ARRAY['كهرباء', 'تكييف'], 4.5, 45, true, 'شركة موثوقة مع خبرة 15 سنة'),
      ('مؤسسة النجاح للسباكة', 'خالد عبدالله السعيد', '+966502345678', 'contact@najah-plumbing.sa', 'الرياض - حي العليا', ARRAY['سباكة', 'صرف صحي'], 4.8, 62, true, 'متخصصون في أعمال السباكة الحديثة'),
      ('شركة البناء الحديث للمقاولات', 'محمد فهد المطيري', '+966503456789', 'info@modernbuild.sa', 'الرياض - حي الربوة', ARRAY['إنشائية', 'ترميم'], 4.2, 38, true, 'شركة متخصصة في الترميمات والصيانة الإنشائية'),
      ('مؤسسة النظافة المتقدمة', 'سعد أحمد الغامدي', '+966504567890', 'info@advanced-clean.sa', 'الرياض - حي السليمانية', ARRAY['نظافة', 'تعقيم'], 4.6, 89, true, 'خدمات نظافة شاملة للمباني'),
      ('شركة الحماية للأمن والسلامة', 'عبدالرحمن علي القحطاني', '+966505678901', 'safety@protection.sa', 'الرياض - حي الورود', ARRAY['أمن وسلامة', 'إطفاء'], 4.9, 52, true, 'متخصصون في أنظمة الإنذار والحريق'),
      ('مؤسسة التميز للصيانة العامة', 'فيصل عبدالعزيز الدوسري', '+966506789012', 'info@excellence-maintenance.sa', 'الرياض - حي النرجس', ARRAY['صيانة عامة', 'كهرباء'], 4.3, 71, true, 'صيانة شاملة لجميع أنواع المباني');
  END IF;
END $$;

-- المرحلة 6.4: إصلاح التحذيرات الأمنية
CREATE OR REPLACE FUNCTION auto_assign_request_workflow()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $function$
DECLARE v_assigned_to UUID; v_sla_hours INT;
BEGIN
  SELECT sla_hours INTO v_sla_hours FROM request_types WHERE id = NEW.request_type_id;
  SELECT user_id INTO v_assigned_to FROM user_roles WHERE role IN ('admin', 'accountant', 'nazer') LIMIT 1;
  INSERT INTO request_workflows (request_id, current_step, assigned_to, workflow_status, sla_due_at)
  VALUES (NEW.id, 1, v_assigned_to, 'active', NOW() + (COALESCE(v_sla_hours, 24) || ' hours')::INTERVAL);
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION calculate_emergency_sla()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.sla_due_at := CASE NEW.urgency_level
    WHEN 'عاجل جداً' THEN NOW() + INTERVAL '4 hours'
    WHEN 'عاجل' THEN NOW() + INTERVAL '24 hours'
    ELSE NOW() + INTERVAL '72 hours'
  END;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION generate_emergency_aid_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp
AS $function$
DECLARE year_part TEXT; sequence_num INTEGER;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO sequence_num FROM emergency_aid_requests WHERE request_number LIKE 'EA-' || year_part || '-%';
  NEW.request_number := 'EA-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  RETURN NEW;
END;
$function$;

-- تحديث المدفوعات المتأخرة
UPDATE rental_payments SET status = 'متأخر'
WHERE due_date < CURRENT_DATE AND status = 'معلق' AND payment_date IS NULL;