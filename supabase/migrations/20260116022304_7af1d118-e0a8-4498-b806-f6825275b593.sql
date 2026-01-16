
-- =====================================================
-- نظام الربط التلقائي بين العقارات والوحدات والعقود
-- =====================================================

-- 1. دالة تحديث حالة العقار بناءً على وحداته
CREATE OR REPLACE FUNCTION public.update_property_status_from_units()
RETURNS TRIGGER AS $$
DECLARE
  v_property_id uuid;
  v_total_units int;
  v_occupied_units int;
  v_maintenance_units int;
  v_vacant_units int;
  v_new_status text;
BEGIN
  -- تحديد العقار المتأثر
  IF TG_OP = 'DELETE' THEN
    v_property_id := OLD.property_id;
  ELSE
    v_property_id := NEW.property_id;
  END IF;

  -- حساب إحصائيات الوحدات
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE occupancy_status = 'مشغول' OR current_contract_id IS NOT NULL),
    COUNT(*) FILTER (WHERE occupancy_status = 'صيانة' OR status = 'صيانة'),
    COUNT(*) FILTER (WHERE (occupancy_status = 'شاغر' OR occupancy_status IS NULL) AND current_contract_id IS NULL AND COALESCE(status, '') != 'صيانة')
  INTO v_total_units, v_occupied_units, v_maintenance_units, v_vacant_units
  FROM property_units
  WHERE property_id = v_property_id;

  -- تحديد حالة العقار
  IF v_total_units = 0 THEN
    v_new_status := 'شاغر';
  ELSIF v_occupied_units = v_total_units THEN
    v_new_status := 'مؤجر';
  ELSIF v_occupied_units > 0 THEN
    v_new_status := 'جزئي';
  ELSIF v_maintenance_units = v_total_units THEN
    v_new_status := 'صيانة';
  ELSE
    v_new_status := 'شاغر';
  END IF;

  -- تحديث العقار (بدون occupancy_percentage لأنه عمود محسوب)
  UPDATE properties
  SET 
    total_units = v_total_units,
    units = v_total_units,
    occupied_units = v_occupied_units,
    available_units = v_vacant_units,
    status = v_new_status,
    updated_at = now()
  WHERE id = v_property_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. دالة تحديث حالة الوحدة عند تغيير العقد
CREATE OR REPLACE FUNCTION public.update_unit_status_from_contract()
RETURNS TRIGGER AS $$
BEGIN
  -- عند إنشاء أو تحديث عقد نشط
  IF TG_OP IN ('INSERT', 'UPDATE') AND NEW.status = 'نشط' THEN
    -- تحديث الوحدات المرتبطة بهذا العقد
    UPDATE property_units
    SET 
      occupancy_status = 'مشغول',
      current_contract_id = NEW.id,
      current_tenant_id = NEW.tenant_id,
      lease_start_date = NEW.start_date,
      lease_end_date = NEW.end_date,
      updated_at = now()
    WHERE current_contract_id = NEW.id 
       OR (property_id = NEW.property_id AND current_contract_id IS NULL AND occupancy_status != 'صيانة');
  END IF;

  -- عند إلغاء أو انتهاء العقد
  IF TG_OP = 'UPDATE' AND OLD.status = 'نشط' AND NEW.status IN ('منتهي', 'ملغي', 'معلق') THEN
    UPDATE property_units
    SET 
      occupancy_status = 'شاغر',
      current_contract_id = NULL,
      current_tenant_id = NULL,
      lease_start_date = NULL,
      lease_end_date = NULL,
      updated_at = now()
    WHERE current_contract_id = OLD.id;
  END IF;

  -- عند حذف العقد
  IF TG_OP = 'DELETE' AND OLD.status = 'نشط' THEN
    UPDATE property_units
    SET 
      occupancy_status = 'شاغر',
      current_contract_id = NULL,
      current_tenant_id = NULL,
      lease_start_date = NULL,
      lease_end_date = NULL,
      updated_at = now()
    WHERE current_contract_id = OLD.id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. حذف الـ Triggers القديمة إن وجدت
DROP TRIGGER IF EXISTS trigger_update_property_status ON property_units;
DROP TRIGGER IF EXISTS trigger_update_unit_from_contract ON contracts;

-- 4. إنشاء Trigger لتحديث حالة العقار عند تغيير الوحدات
CREATE TRIGGER trigger_update_property_status
AFTER INSERT OR UPDATE OR DELETE ON property_units
FOR EACH ROW
EXECUTE FUNCTION update_property_status_from_units();

-- 5. إنشاء Trigger لتحديث حالة الوحدة عند تغيير العقود
CREATE TRIGGER trigger_update_unit_from_contract
AFTER INSERT OR UPDATE OR DELETE ON contracts
FOR EACH ROW
EXECUTE FUNCTION update_unit_status_from_contract();

-- 6. تحديث البيانات الحالية لإصلاح التناقضات
UPDATE properties p
SET 
  total_units = COALESCE((
    SELECT COUNT(*) FROM property_units pu WHERE pu.property_id = p.id
  ), 0),
  units = COALESCE((
    SELECT COUNT(*) FROM property_units pu WHERE pu.property_id = p.id
  ), 0),
  occupied_units = COALESCE((
    SELECT COUNT(*) FROM property_units pu 
    WHERE pu.property_id = p.id AND (pu.occupancy_status = 'مشغول' OR pu.current_contract_id IS NOT NULL)
  ), 0),
  available_units = COALESCE((
    SELECT COUNT(*) FROM property_units pu 
    WHERE pu.property_id = p.id 
    AND (pu.occupancy_status = 'شاغر' OR pu.occupancy_status IS NULL) 
    AND pu.current_contract_id IS NULL
  ), 0),
  status = CASE 
    WHEN COALESCE((SELECT COUNT(*) FROM property_units pu WHERE pu.property_id = p.id), 0) = 0 THEN 'شاغر'
    WHEN COALESCE((SELECT COUNT(*) FROM property_units pu WHERE pu.property_id = p.id AND (pu.occupancy_status = 'مشغول' OR pu.current_contract_id IS NOT NULL)), 0) = 
         COALESCE((SELECT COUNT(*) FROM property_units pu WHERE pu.property_id = p.id), 0) THEN 'مؤجر'
    WHEN COALESCE((SELECT COUNT(*) FROM property_units pu WHERE pu.property_id = p.id AND (pu.occupancy_status = 'مشغول' OR pu.current_contract_id IS NOT NULL)), 0) > 0 THEN 'جزئي'
    ELSE 'شاغر'
  END,
  updated_at = now();
