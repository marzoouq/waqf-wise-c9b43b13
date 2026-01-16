-- إصلاح تحذير الأمان: تحديد search_path للدالة
CREATE OR REPLACE FUNCTION auto_link_contract_to_units()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vacant_units UUID[];
  v_unit_id UUID;
  v_units_to_link INTEGER;
  v_linked_count INTEGER := 0;
  v_tenant_id UUID;
BEGIN
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