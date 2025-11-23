-- المرحلة 1: إصلاح دالة create_default_units (بدون annual_rent لأنه محسوب تلقائياً)
DROP FUNCTION IF EXISTS create_default_units() CASCADE;

CREATE OR REPLACE FUNCTION public.create_default_units()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  unit_num INTEGER;
  total_units_count INTEGER;
  unit_type_value TEXT;
BEGIN
  -- استخدام units أو total_units (أيهما موجود)
  total_units_count := COALESCE(NEW.units, NEW.total_units, 1);
  
  -- تحديد نوع الوحدة بناءً على نوع العقار (دعم العربية والإنجليزية)
  unit_type_value := CASE 
    WHEN NEW.type ILIKE '%سكني%' OR NEW.type = 'residential' THEN 'apartment'
    WHEN NEW.type ILIKE '%تجاري%' OR NEW.type = 'commercial' THEN 'shop'
    WHEN NEW.type ILIKE '%صناعي%' OR NEW.type = 'industrial' THEN 'warehouse'
    WHEN NEW.type ILIKE '%مكتب%' OR NEW.type = 'office' THEN 'office'
    WHEN NEW.type ILIKE '%أرض%' OR NEW.type = 'land' THEN 'land'
    ELSE 'other'
  END;
  
  -- إنشاء الوحدات (بدون annual_rent لأنه محسوب تلقائياً)
  FOR unit_num IN 1..total_units_count LOOP
    INSERT INTO property_units (
      property_id,
      unit_number,
      unit_name,
      unit_type,
      status
    ) VALUES (
      NEW.id,
      'U-' || LPAD(unit_num::TEXT, 3, '0'),
      'وحدة ' || unit_num,
      unit_type_value,
      'available'
    );
  END LOOP;
  
  RETURN NEW;
END;
$function$;

-- إعادة إنشاء trigger
DROP TRIGGER IF EXISTS trigger_create_default_units ON properties;
CREATE TRIGGER trigger_create_default_units
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION create_default_units();

-- المرحلة 2: إنشاء وحدات للعقارات الموجودة التي ليس لها وحدات
DO $$
DECLARE
  prop RECORD;
  unit_num INTEGER;
  total_units_count INTEGER;
  unit_type_value TEXT;
BEGIN
  -- البحث عن العقارات التي ليس لها وحدات
  FOR prop IN 
    SELECT p.* 
    FROM properties p
    LEFT JOIN property_units pu ON pu.property_id = p.id
    WHERE pu.id IS NULL
  LOOP
    total_units_count := COALESCE(prop.units, prop.total_units, 1);
    
    -- تحديد نوع الوحدة
    unit_type_value := CASE 
      WHEN prop.type ILIKE '%سكني%' OR prop.type = 'residential' THEN 'apartment'
      WHEN prop.type ILIKE '%تجاري%' OR prop.type = 'commercial' THEN 'shop'
      WHEN prop.type ILIKE '%صناعي%' OR prop.type = 'industrial' THEN 'warehouse'
      WHEN prop.type ILIKE '%مكتب%' OR prop.type = 'office' THEN 'office'
      WHEN prop.type ILIKE '%أرض%' OR prop.type = 'land' THEN 'land'
      ELSE 'other'
    END;
    
    -- إنشاء الوحدات (بدون annual_rent)
    FOR unit_num IN 1..total_units_count LOOP
      INSERT INTO property_units (
        property_id,
        unit_number,
        unit_name,
        unit_type,
        status
      ) VALUES (
        prop.id,
        'U-' || LPAD(unit_num::TEXT, 3, '0'),
        'وحدة ' || unit_num,
        unit_type_value,
        'available'
      );
    END LOOP;
    
    RAISE NOTICE 'تم إنشاء % وحدات للعقار: %', total_units_count, prop.name;
  END LOOP;
END $$;