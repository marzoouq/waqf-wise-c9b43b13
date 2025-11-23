-- إصلاح تحذيرات الأمان بحذف الـ triggers أولاً

-- حذف الـ triggers المرتبطة
DROP TRIGGER IF EXISTS trigger_update_unit_status ON contract_units;
DROP TRIGGER IF EXISTS trigger_create_default_units ON properties;

-- حذف الدوال وإعادة إنشائها مع search_path
DROP FUNCTION IF EXISTS calculate_occupied_units(uuid);
DROP FUNCTION IF EXISTS update_unit_status();
DROP FUNCTION IF EXISTS create_default_units();
DROP FUNCTION IF EXISTS check_units_availability(uuid[]);

-- إعادة إنشاء الدوال بشكل آمن
CREATE FUNCTION calculate_occupied_units(property_uuid UUID)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  occupied_count INTEGER;
BEGIN
  SELECT COUNT(DISTINCT cu.property_unit_id)
  INTO occupied_count
  FROM contract_units cu
  INNER JOIN contracts c ON c.id = cu.contract_id
  INNER JOIN property_units pu ON pu.id = cu.property_unit_id
  WHERE pu.property_id = property_uuid
    AND c.status = 'active'
    AND c.end_date >= CURRENT_DATE;
  
  RETURN COALESCE(occupied_count, 0);
END;
$$;

CREATE FUNCTION update_unit_status()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE property_units
    SET status = 'occupied',
        updated_at = NOW()
    WHERE id = NEW.property_unit_id;
    RETURN NEW;
  END IF;
  
  IF (TG_OP = 'DELETE') THEN
    IF NOT EXISTS (
      SELECT 1 
      FROM contract_units cu
      INNER JOIN contracts c ON c.id = cu.contract_id
      WHERE cu.property_unit_id = OLD.property_unit_id
        AND c.status = 'active'
        AND c.end_date >= CURRENT_DATE
        AND cu.id != OLD.id
    ) THEN
      UPDATE property_units
      SET status = 'available',
          updated_at = NOW()
      WHERE id = OLD.property_unit_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE FUNCTION create_default_units()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  unit_num INTEGER;
BEGIN
  FOR unit_num IN 1..COALESCE(NEW.total_units, 1) LOOP
    INSERT INTO property_units (
      property_id,
      unit_number,
      unit_name,
      unit_type,
      status,
      annual_rent
    ) VALUES (
      NEW.id,
      'U-' || LPAD(unit_num::TEXT, 3, '0'),
      'وحدة ' || unit_num,
      CASE 
        WHEN NEW.type = 'residential' THEN 'apartment'
        WHEN NEW.type = 'commercial' THEN 'shop'
        ELSE 'other'
      END,
      'available',
      COALESCE(NEW.monthly_revenue, 0) * 12
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

CREATE FUNCTION check_units_availability(unit_ids UUID[])
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  unavailable_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO unavailable_count
  FROM property_units
  WHERE id = ANY(unit_ids)
    AND status != 'available';
  
  RETURN unavailable_count = 0;
END;
$$;

-- إعادة إنشاء الـ triggers
CREATE TRIGGER trigger_update_unit_status
AFTER INSERT OR DELETE ON contract_units
FOR EACH ROW
EXECUTE FUNCTION update_unit_status();

CREATE TRIGGER trigger_create_default_units
AFTER INSERT ON properties
FOR EACH ROW
EXECUTE FUNCTION create_default_units();