-- =====================================================
-- المرحلة 1: إنشاء Triggers للمزامنة التلقائية
-- =====================================================

-- 1.1 Trigger لمزامنة الوحدات عند ربط عقد
CREATE OR REPLACE FUNCTION sync_unit_on_contract_link()
RETURNS TRIGGER AS $$
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

DROP TRIGGER IF EXISTS trigger_sync_unit_on_contract_link ON contract_units;
CREATE TRIGGER trigger_sync_unit_on_contract_link
AFTER INSERT ON contract_units
FOR EACH ROW
EXECUTE FUNCTION sync_unit_on_contract_link();

-- 1.2 Trigger لإلغاء الربط عند حذف من contract_units
CREATE OR REPLACE FUNCTION sync_unit_on_contract_unlink()
RETURNS TRIGGER AS $$
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

DROP TRIGGER IF EXISTS trigger_sync_unit_on_contract_unlink ON contract_units;
CREATE TRIGGER trigger_sync_unit_on_contract_unlink
AFTER DELETE ON contract_units
FOR EACH ROW
EXECUTE FUNCTION sync_unit_on_contract_unlink();

-- 1.3 Trigger لتحديث الوحدات عند تغيير حالة العقد
CREATE OR REPLACE FUNCTION sync_units_on_contract_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا أصبح العقد نشطاً
  IF NEW.status = 'نشط' AND (OLD.status IS NULL OR OLD.status != 'نشط') THEN
    UPDATE property_units
    SET 
      current_contract_id = NEW.id,
      current_tenant_id = NEW.tenant_id,
      occupancy_status = 'مشغول',
      updated_at = NOW()
    WHERE id IN (SELECT property_unit_id FROM contract_units WHERE contract_id = NEW.id);
  
  -- إذا أصبح العقد منتهي أو ملغي
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

DROP TRIGGER IF EXISTS trigger_sync_units_on_contract_change ON contracts;
CREATE TRIGGER trigger_sync_units_on_contract_change
AFTER UPDATE ON contracts
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION sync_units_on_contract_status_change();

-- 1.4 Trigger لتحديث عدد الوحدات في العقارات تلقائياً
CREATE OR REPLACE FUNCTION update_property_unit_counts()
RETURNS TRIGGER AS $$
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

DROP TRIGGER IF EXISTS trigger_update_property_counts ON property_units;
CREATE TRIGGER trigger_update_property_counts
AFTER INSERT OR UPDATE OF occupancy_status OR DELETE ON property_units
FOR EACH ROW
EXECUTE FUNCTION update_property_unit_counts();

-- 1.5 Trigger لتحديث units_count في العقود
CREATE OR REPLACE FUNCTION update_contract_units_count()
RETURNS TRIGGER AS $$
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

DROP TRIGGER IF EXISTS trigger_update_contract_units_count ON contract_units;
CREATE TRIGGER trigger_update_contract_units_count
AFTER INSERT OR DELETE ON contract_units
FOR EACH ROW
EXECUTE FUNCTION update_contract_units_count();