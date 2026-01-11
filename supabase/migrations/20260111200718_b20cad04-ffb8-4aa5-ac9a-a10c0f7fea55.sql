-- إضافة Trigger لمزامنة إيرادات العقار تلقائياً من الوحدات
CREATE OR REPLACE FUNCTION sync_property_revenue_from_units()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE properties p
  SET monthly_revenue = (
    SELECT COALESCE(SUM(pu.monthly_rent), 0)
    FROM property_units pu
    WHERE pu.property_id = p.id
    AND pu.occupancy_status = 'مشغول'
  ),
  updated_at = now()
  WHERE p.id = COALESCE(NEW.property_id, OLD.property_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- حذف الـ Trigger القديم إذا كان موجوداً
DROP TRIGGER IF EXISTS trigger_sync_property_revenue ON property_units;

-- إنشاء الـ Trigger الجديد
CREATE TRIGGER trigger_sync_property_revenue
AFTER INSERT OR UPDATE OR DELETE ON property_units
FOR EACH ROW
EXECUTE FUNCTION sync_property_revenue_from_units();