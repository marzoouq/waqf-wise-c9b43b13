-- دالة لحساب وتحديث عدد الوحدات المشغولة بناءً على العقود النشطة
CREATE OR REPLACE FUNCTION update_property_occupied_units()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_property_id UUID;
  v_active_contracts_count INTEGER;
BEGIN
  -- تحديد معرف العقار
  IF TG_OP = 'DELETE' THEN
    v_property_id := OLD.property_id;
  ELSE
    v_property_id := NEW.property_id;
  END IF;

  -- حساب عدد العقود النشطة للعقار
  SELECT COUNT(*)
  INTO v_active_contracts_count
  FROM contracts
  WHERE property_id = v_property_id
    AND status = 'نشط';

  -- تحديث عدد الوحدات المشغولة
  UPDATE properties
  SET occupied_units = v_active_contracts_count,
      updated_at = now()
  WHERE id = v_property_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- إنشاء trigger لتحديث تلقائي عند إضافة/تعديل/حذف عقد
DROP TRIGGER IF EXISTS trigger_update_occupied_units ON contracts;
CREATE TRIGGER trigger_update_occupied_units
  AFTER INSERT OR UPDATE OF status OR DELETE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_property_occupied_units();

-- تحديث البيانات الحالية لجميع العقارات
UPDATE properties p
SET occupied_units = (
  SELECT COUNT(*)
  FROM contracts c
  WHERE c.property_id = p.id
    AND c.status = 'نشط'
),
updated_at = now();