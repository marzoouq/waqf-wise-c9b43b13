-- إصلاح تحذير الأمان - تحديد search_path
CREATE OR REPLACE FUNCTION sync_unit_occupancy_status()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'نشط' THEN
    UPDATE property_units SET occupancy_status = 'مشغول', status = 'مشغول', updated_at = now() WHERE property_id = NEW.property_id;
  ELSIF NEW.status IN ('منتهي', 'ملغي') THEN
    IF NOT EXISTS (SELECT 1 FROM contracts WHERE property_id = NEW.property_id AND status = 'نشط' AND id != NEW.id) THEN
      UPDATE property_units SET occupancy_status = 'شاغر', status = 'متاح', updated_at = now() WHERE property_id = NEW.property_id;
    END IF;
  END IF;
  UPDATE properties SET occupied = (SELECT COUNT(*) FROM property_units WHERE property_units.property_id = NEW.property_id AND property_units.occupancy_status = 'مشغول'), updated_at = now() WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;