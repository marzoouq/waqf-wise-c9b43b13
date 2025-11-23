-- إصلاح نظام الوحدات وربطها بالعقود

-- 1. حذف الدالة القديمة وإعادة إنشائها بشكل صحيح
DROP FUNCTION IF EXISTS calculate_occupied_units(uuid);

CREATE FUNCTION calculate_occupied_units(property_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  occupied_count INTEGER;
BEGIN
  -- حساب الوحدات المشغولة من خلال العقود النشطة المرتبطة بوحدات فعلية
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
$$ LANGUAGE plpgsql;

-- 2. دالة لتحديث حالة الوحدة بناءً على العقود
CREATE OR REPLACE FUNCTION update_unit_status()
RETURNS TRIGGER AS $$
BEGIN
  -- عند إضافة عقد جديد، تحديث حالة الوحدة إلى "مؤجرة"
  IF (TG_OP = 'INSERT') THEN
    UPDATE property_units
    SET status = 'occupied',
        updated_at = NOW()
    WHERE id = NEW.property_unit_id;
    RETURN NEW;
  END IF;
  
  -- عند حذف عقد، التحقق من وجود عقود أخرى نشطة
  IF (TG_OP = 'DELETE') THEN
    -- التحقق من وجود عقود نشطة أخرى لنفس الوحدة
    IF NOT EXISTS (
      SELECT 1 
      FROM contract_units cu
      INNER JOIN contracts c ON c.id = cu.contract_id
      WHERE cu.property_unit_id = OLD.property_unit_id
        AND c.status = 'active'
        AND c.end_date >= CURRENT_DATE
        AND cu.id != OLD.id
    ) THEN
      -- لا توجد عقود نشطة، تحديث الحالة إلى "متاحة"
      UPDATE property_units
      SET status = 'available',
          updated_at = NOW()
      WHERE id = OLD.property_unit_id;
    END IF;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. إنشاء trigger لتحديث حالة الوحدات تلقائياً
DROP TRIGGER IF EXISTS trigger_update_unit_status ON contract_units;
CREATE TRIGGER trigger_update_unit_status
AFTER INSERT OR DELETE ON contract_units
FOR EACH ROW
EXECUTE FUNCTION update_unit_status();

-- 4. دالة لإنشاء وحدات افتراضية عند إنشاء عقار
CREATE OR REPLACE FUNCTION create_default_units()
RETURNS TRIGGER AS $$
DECLARE
  unit_num INTEGER;
BEGIN
  -- إنشاء وحدات بناءً على عدد الوحدات المحدد
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
$$ LANGUAGE plpgsql;

-- 5. إنشاء trigger لإنشاء الوحدات تلقائياً
DROP TRIGGER IF EXISTS trigger_create_default_units ON properties;
CREATE TRIGGER trigger_create_default_units
AFTER INSERT ON properties
FOR EACH ROW
EXECUTE FUNCTION create_default_units();

-- 6. تحديث الوحدات الموجودة للعقارات الحالية (لمرة واحدة)
DO $$
DECLARE
  prop RECORD;
  unit_num INTEGER;
BEGIN
  FOR prop IN 
    SELECT id, total_units, type, monthly_revenue
    FROM properties 
    WHERE NOT EXISTS (
      SELECT 1 FROM property_units WHERE property_id = properties.id
    )
  LOOP
    FOR unit_num IN 1..COALESCE(prop.total_units, 1) LOOP
      INSERT INTO property_units (
        property_id,
        unit_number,
        unit_name,
        unit_type,
        status,
        annual_rent
      ) VALUES (
        prop.id,
        'U-' || LPAD(unit_num::TEXT, 3, '0'),
        'وحدة ' || unit_num,
        CASE 
          WHEN prop.type = 'residential' THEN 'apartment'
          WHEN prop.type = 'commercial' THEN 'shop'
          ELSE 'other'
        END,
        'available',
        COALESCE(prop.monthly_revenue, 0) * 12
      );
    END LOOP;
  END LOOP;
END $$;

-- 7. دالة للتحقق من توفر الوحدات قبل إنشاء عقد
CREATE OR REPLACE FUNCTION check_units_availability(unit_ids UUID[])
RETURNS BOOLEAN AS $$
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
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_occupied_units IS 'حساب الوحدات المشغولة بناءً على العقود النشطة والوحدات الفعلية';
COMMENT ON FUNCTION update_unit_status IS 'تحديث حالة الوحدة تلقائياً عند إضافة أو حذف عقد';
COMMENT ON FUNCTION create_default_units IS 'إنشاء وحدات افتراضية عند إنشاء عقار جديد';
COMMENT ON FUNCTION check_units_availability IS 'التحقق من توفر الوحدات قبل إنشاء عقد';