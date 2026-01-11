-- إصلاح تحذيرات الأمان: إضافة search_path للدوال
-- =====================================================

CREATE OR REPLACE FUNCTION sync_unit_on_contract_link()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tenant_id UUID;
  v_contract_status TEXT;
BEGIN
  SELECT tenant_id, status INTO v_tenant_id, v_contract_status 
  FROM contracts WHERE id = NEW.contract_id;
  
  IF v_contract_status = 'نشط' THEN
    UPDATE property_units
    SET 
      current_contract_id = NEW.contract_id,
      current_tenant_id = v_tenant_id,
      occupancy_status = 'مشغول',
      updated_at = NOW()
    WHERE id = NEW.property_unit_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_unit_on_contract_unlink()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE property_units
  SET 
    current_contract_id = NULL,
    current_tenant_id = NULL,
    occupancy_status = 'شاغر',
    updated_at = NOW()
  WHERE id = OLD.property_unit_id
    AND current_contract_id = OLD.contract_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION sync_units_on_contract_status_change()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'نشط' AND (OLD.status IS NULL OR OLD.status != 'نشط') THEN
    UPDATE property_units
    SET 
      current_contract_id = NEW.id,
      current_tenant_id = NEW.tenant_id,
      occupancy_status = 'مشغول',
      updated_at = NOW()
    WHERE id IN (SELECT property_unit_id FROM contract_units WHERE contract_id = NEW.id);
  
  ELSIF NEW.status IN ('منتهي', 'ملغي') AND OLD.status = 'نشط' THEN
    UPDATE property_units
    SET 
      current_contract_id = NULL,
      current_tenant_id = NULL,
      occupancy_status = 'شاغر',
      updated_at = NOW()
    WHERE current_contract_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_property_unit_counts()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_property_id UUID;
BEGIN
  v_property_id := COALESCE(NEW.property_id, OLD.property_id);
  
  UPDATE properties
  SET 
    units = (SELECT COUNT(*) FROM property_units WHERE property_id = v_property_id),
    occupied = (SELECT COUNT(*) FROM property_units WHERE property_id = v_property_id AND occupancy_status = 'مشغول'),
    updated_at = NOW()
  WHERE id = v_property_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_contract_units_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_contract_id UUID;
BEGIN
  v_contract_id := COALESCE(NEW.contract_id, OLD.contract_id);
  
  UPDATE contracts
  SET 
    units_count = (SELECT COUNT(*) FROM contract_units WHERE contract_id = v_contract_id),
    updated_at = NOW()
  WHERE id = v_contract_id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;