-- المرحلة 1: تطوير هيكل قاعدة البيانات

-- 1.1 إضافة حقل units_count لجدول contracts
ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS units_count INTEGER DEFAULT 1;

COMMENT ON COLUMN contracts.units_count IS 'عدد الوحدات التي يغطيها هذا العقد';

-- 1.2 إنشاء جدول contract_units لربط العقود بالوحدات
CREATE TABLE IF NOT EXISTS contract_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  property_unit_id UUID NOT NULL REFERENCES property_units(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contract_id, property_unit_id)
);

CREATE INDEX IF NOT EXISTS idx_contract_units_contract ON contract_units(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_units_unit ON contract_units(property_unit_id);

COMMENT ON TABLE contract_units IS 'جدول ربط العقود بالوحدات المحددة';

-- المرحلة 2: تحديث آلية الحساب التلقائي

-- 2.1 تعديل دالة update_property_occupied_units لحساب SUM(units_count)
CREATE OR REPLACE FUNCTION update_property_occupied_units()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_property_id UUID;
  v_occupied_count INTEGER;
BEGIN
  -- تحديد معرف العقار
  IF TG_OP = 'DELETE' THEN
    v_property_id := OLD.property_id;
  ELSE
    v_property_id := NEW.property_id;
  END IF;

  -- حساب مجموع الوحدات المشغولة من العقود النشطة
  SELECT COALESCE(SUM(units_count), 0)
  INTO v_occupied_count
  FROM contracts
  WHERE property_id = v_property_id
    AND status = 'نشط';

  -- تحديث عدد الوحدات المشغولة
  UPDATE properties
  SET occupied_units = v_occupied_count,
      updated_at = now()
  WHERE id = v_property_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 2.2 إنشاء دالة auto_link_contract_to_units لربط الوحدات تلقائياً
CREATE OR REPLACE FUNCTION auto_link_contract_to_units()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_vacant_units UUID[];
  v_unit_id UUID;
  v_units_to_link INTEGER;
  v_linked_count INTEGER := 0;
BEGIN
  -- تنفيذ فقط عند إنشاء عقد جديد أو تحديث حالته لنشط
  IF (TG_OP = 'INSERT' AND NEW.status = 'نشط') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'نشط' AND NEW.status = 'نشط') THEN
    
    v_units_to_link := NEW.units_count;
    
    -- البحث عن الوحدات الشاغرة في العقار
    SELECT ARRAY_AGG(id)
    INTO v_vacant_units
    FROM property_units
    WHERE property_id = NEW.property_id
      AND occupancy_status = 'شاغر'
    LIMIT v_units_to_link;
    
    -- ربط الوحدات بالعقد
    IF v_vacant_units IS NOT NULL THEN
      FOREACH v_unit_id IN ARRAY v_vacant_units LOOP
        -- إنشاء رابط في جدول contract_units
        INSERT INTO contract_units (contract_id, property_unit_id)
        VALUES (NEW.id, v_unit_id)
        ON CONFLICT (contract_id, property_unit_id) DO NOTHING;
        
        -- تحديث حالة الوحدة
        UPDATE property_units
        SET occupancy_status = 'مشغول',
            current_contract_id = NEW.id,
            updated_at = now()
        WHERE id = v_unit_id;
        
        v_linked_count := v_linked_count + 1;
      END LOOP;
    END IF;
  END IF;
  
  -- عند إلغاء أو إنهاء العقد، تحرير الوحدات
  IF (TG_OP = 'UPDATE' AND OLD.status = 'نشط' AND NEW.status != 'نشط') OR
     (TG_OP = 'DELETE' AND OLD.status = 'نشط') THEN
    
    -- تحرير جميع الوحدات المرتبطة بالعقد
    UPDATE property_units
    SET occupancy_status = 'شاغر',
        current_contract_id = NULL,
        updated_at = now()
    WHERE id IN (
      SELECT property_unit_id 
      FROM contract_units 
      WHERE contract_id = COALESCE(NEW.id, OLD.id)
    );
    
    -- حذف الروابط
    DELETE FROM contract_units
    WHERE contract_id = COALESCE(NEW.id, OLD.id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- 2.3 إنشاء trigger تلقائي للربط
DROP TRIGGER IF EXISTS trigger_auto_link_units ON contracts;
CREATE TRIGGER trigger_auto_link_units
  AFTER INSERT OR UPDATE OF status, units_count ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_contract_to_units();

-- المرحلة 3: إصلاح البيانات الحالية

-- 3.1 تحديث العقود الموجودة بقيمة افتراضية units_count = 1
UPDATE contracts
SET units_count = 1
WHERE units_count IS NULL;

-- 3.2 تحديث عقد عبدالعزيز (100,000 ريال) إلى 4 وحدات
UPDATE contracts
SET units_count = 4,
    updated_at = now()
WHERE monthly_rent = 100000
  AND status = 'نشط';

-- 3.3 ربط العقود النشطة الحالية بالوحدات
DO $$
DECLARE
  v_contract RECORD;
  v_vacant_units UUID[];
  v_unit_id UUID;
  v_linked_count INTEGER;
BEGIN
  FOR v_contract IN 
    SELECT id, property_id, units_count
    FROM contracts
    WHERE status = 'نشط'
    ORDER BY created_at
  LOOP
    v_linked_count := 0;
    
    -- البحث عن وحدات شاغرة
    SELECT ARRAY_AGG(id)
    INTO v_vacant_units
    FROM property_units
    WHERE property_id = v_contract.property_id
      AND occupancy_status = 'شاغر'
    LIMIT v_contract.units_count;
    
    -- ربط الوحدات
    IF v_vacant_units IS NOT NULL THEN
      FOREACH v_unit_id IN ARRAY v_vacant_units LOOP
        INSERT INTO contract_units (contract_id, property_unit_id)
        VALUES (v_contract.id, v_unit_id)
        ON CONFLICT (contract_id, property_unit_id) DO NOTHING;
        
        UPDATE property_units
        SET occupancy_status = 'مشغول',
            current_contract_id = v_contract.id,
            updated_at = now()
        WHERE id = v_unit_id;
        
        v_linked_count := v_linked_count + 1;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;

-- 3.4 إعادة حساب occupied_units لجميع العقارات
UPDATE properties p
SET occupied_units = (
  SELECT COALESCE(SUM(units_count), 0)
  FROM contracts c
  WHERE c.property_id = p.id
    AND c.status = 'نشط'
),
updated_at = now();