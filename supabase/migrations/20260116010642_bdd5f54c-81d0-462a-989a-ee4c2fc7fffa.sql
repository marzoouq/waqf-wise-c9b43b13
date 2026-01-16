-- المرحلة 1.1: إصلاح Foreign Key لـ current_tenant_id
ALTER TABLE property_units 
DROP CONSTRAINT IF EXISTS property_units_current_tenant_id_fkey;

ALTER TABLE property_units 
ADD CONSTRAINT property_units_current_tenant_id_fkey 
FOREIGN KEY (current_tenant_id) REFERENCES tenants(id) ON DELETE SET NULL;

-- المرحلة 1.2: إصلاح Check Constraint للعقارات
ALTER TABLE properties DROP CONSTRAINT IF EXISTS occupied_units_check;

ALTER TABLE properties ADD CONSTRAINT occupied_units_check 
CHECK (occupied IS NULL OR occupied >= 0);

-- المرحلة 2: تحديث Trigger auto_link_contract_to_units
CREATE OR REPLACE FUNCTION auto_link_contract_to_units()
RETURNS TRIGGER AS $$
DECLARE
  v_vacant_units UUID[];
  v_unit_id UUID;
  v_units_to_link INTEGER;
  v_linked_count INTEGER := 0;
  v_tenant_id UUID;
BEGIN
  -- جلب tenant_id من العقد
  v_tenant_id := NEW.tenant_id;
  
  IF (TG_OP = 'INSERT' AND NEW.status = 'نشط') OR 
     (TG_OP = 'UPDATE' AND OLD.status != 'نشط' AND NEW.status = 'نشط') THEN
    
    v_units_to_link := COALESCE(NEW.units_count, 1);
    
    SELECT ARRAY_AGG(id)
    INTO v_vacant_units
    FROM property_units
    WHERE property_id = NEW.property_id
      AND occupancy_status = 'شاغر'
    LIMIT v_units_to_link;
    
    IF v_vacant_units IS NOT NULL THEN
      FOREACH v_unit_id IN ARRAY v_vacant_units LOOP
        INSERT INTO contract_units (contract_id, property_unit_id)
        VALUES (NEW.id, v_unit_id)
        ON CONFLICT (contract_id, property_unit_id) DO NOTHING;
        
        UPDATE property_units
        SET occupancy_status = 'مشغول',
            current_contract_id = NEW.id,
            current_tenant_id = v_tenant_id,
            updated_at = now()
        WHERE id = v_unit_id;
        
        v_linked_count := v_linked_count + 1;
      END LOOP;
    END IF;
  END IF;
  
  IF (TG_OP = 'UPDATE' AND OLD.status = 'نشط' AND NEW.status != 'نشط') OR
     (TG_OP = 'DELETE' AND OLD.status = 'نشط') THEN
    
    UPDATE property_units
    SET occupancy_status = 'شاغر',
        current_contract_id = NULL,
        current_tenant_id = NULL,
        updated_at = now()
    WHERE id IN (
      SELECT property_unit_id 
      FROM contract_units 
      WHERE contract_id = COALESCE(NEW.id, OLD.id)
    );
    
    DELETE FROM contract_units
    WHERE contract_id = COALESCE(NEW.id, OLD.id);
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- المرحلة 5: تنظيف البيانات المتضاربة
UPDATE property_units 
SET current_tenant_id = NULL 
WHERE current_tenant_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM tenants t WHERE t.id = property_units.current_tenant_id
  );

UPDATE properties p
SET occupied = (
  SELECT COUNT(*) 
  FROM property_units pu 
  WHERE pu.property_id = p.id 
    AND pu.occupancy_status = 'مشغول'
);