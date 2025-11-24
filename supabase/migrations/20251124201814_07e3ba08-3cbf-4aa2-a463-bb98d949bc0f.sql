-- ============================================================================
-- المرحلة 5.1: تنظيف قاعدة البيانات وإصلاح المشاكل الأمنية
-- ============================================================================

-- 1. حذف أنواع الطلبات المكررة (الإبقاء على الأنواع العربية فقط)
DELETE FROM request_types 
WHERE name_en IN (
  'emergency_aid',
  'loan_request', 
  'data_update',
  'add_newborn',
  'independence',
  'complaint',
  'inquiry'
);

-- 2. تحديث الأنواع المتبقية بأيقونات صحيحة وأوصاف محسّنة
UPDATE request_types SET 
  icon = 'AlertCircle',
  description = 'طلب مساعدة مالية عاجلة لحالة طارئة',
  sla_hours = 24,
  requires_approval = true,
  is_active = true
WHERE name_ar = 'فزعة طارئة';

UPDATE request_types SET 
  icon = 'DollarSign',
  description = 'طلب قرض حسن من الوقف مع جدول سداد',
  sla_hours = 72,
  requires_approval = true,
  is_active = true
WHERE name_ar = 'قرض';

UPDATE request_types SET 
  icon = 'Edit',
  description = 'طلب تحديث أو تعديل البيانات الشخصية',
  sla_hours = 48,
  requires_approval = false,
  is_active = true
WHERE name_ar = 'تحديث بيانات';

UPDATE request_types SET 
  icon = 'Baby',
  description = 'طلب إضافة مولود جديد إلى العائلة',
  sla_hours = 48,
  requires_approval = true,
  is_active = true
WHERE name_ar = 'إضافة مولود';

UPDATE request_types SET 
  icon = 'Users',
  description = 'طلب استقلالية مالية عن العائلة الأصلية',
  sla_hours = 120,
  requires_approval = true,
  is_active = true
WHERE name_ar = 'استقلالية';

UPDATE request_types SET 
  icon = 'AlertTriangle',
  description = 'تقديم شكوى أو اعتراض على قرار',
  sla_hours = 96,
  requires_approval = false,
  is_active = true
WHERE name_ar = 'شكوى';

UPDATE request_types SET 
  icon = 'HelpCircle',
  description = 'استفسار عام عن الوقف أو الخدمات',
  sla_hours = 24,
  requires_approval = false,
  is_active = true
WHERE name_ar = 'استفسار';

-- 3. إصلاح المشاكل الأمنية - إضافة search_path للـ Functions
-- Function: update_beneficiary_stats
DROP FUNCTION IF EXISTS update_beneficiary_stats();
CREATE OR REPLACE FUNCTION update_beneficiary_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE beneficiaries
    SET 
      total_received = COALESCE((
        SELECT SUM(amount) 
        FROM payment_voucher_items 
        WHERE beneficiary_id = NEW.beneficiary_id
      ), 0),
      pending_requests = COALESCE((
        SELECT COUNT(*) 
        FROM beneficiary_requests 
        WHERE beneficiary_id = NEW.beneficiary_id 
        AND status IN ('قيد المراجعة', 'قيد المعالجة')
      ), 0)
    WHERE id = NEW.beneficiary_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function: calculate_sla_due_date
DROP FUNCTION IF EXISTS calculate_sla_due_date(uuid);
CREATE OR REPLACE FUNCTION calculate_sla_due_date(p_request_type_id uuid)
RETURNS timestamp with time zone
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sla_hours integer;
BEGIN
  SELECT sla_hours INTO v_sla_hours
  FROM request_types
  WHERE id = p_request_type_id;
  
  RETURN now() + (v_sla_hours || ' hours')::interval;
END;
$$;

-- Function: check_request_overdue
DROP FUNCTION IF EXISTS check_request_overdue();
CREATE OR REPLACE FUNCTION check_request_overdue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.is_overdue := (NEW.sla_due_at < now() AND NEW.status IN ('قيد المراجعة', 'قيد المعالجة'));
  RETURN NEW;
END;
$$;

-- 4. إعادة إنشاء الـ Triggers
DROP TRIGGER IF EXISTS check_overdue_on_update ON beneficiary_requests;
CREATE TRIGGER check_overdue_on_update
  BEFORE UPDATE ON beneficiary_requests
  FOR EACH ROW
  EXECUTE FUNCTION check_request_overdue();

-- 5. تحديث SLA للطلبات الموجودة
UPDATE beneficiary_requests br
SET sla_due_at = br.submitted_at + (rt.sla_hours || ' hours')::interval
FROM request_types rt
WHERE br.request_type_id = rt.id
AND br.sla_due_at IS NULL;

-- 6. تحديث is_overdue للطلبات الموجودة
UPDATE beneficiary_requests
SET is_overdue = (sla_due_at < now() AND status IN ('قيد المراجعة', 'قيد المعالجة'))
WHERE is_overdue IS NULL OR is_overdue = false;