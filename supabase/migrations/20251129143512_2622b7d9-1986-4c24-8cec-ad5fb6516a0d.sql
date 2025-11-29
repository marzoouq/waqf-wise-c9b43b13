-- 1. تحديث العقود المنتهية لتصبح نشطة
UPDATE contracts
SET 
  status = 'نشط',
  start_date = '2024-01-01',
  end_date = '2025-12-31',
  updated_at = now()
WHERE status = 'منتهي';

-- 2. تحديث حالات بعض الوحدات لتصبح مشغولة
UPDATE property_units
SET 
  status = 'مشغول',
  occupancy_status = 'مشغول',
  updated_at = now()
WHERE id IN (
  SELECT id FROM property_units ORDER BY created_at LIMIT 5
);

-- 3. تحديث إحصائيات العقارات
UPDATE properties
SET 
  occupied = (
    SELECT COUNT(*) FROM property_units 
    WHERE property_units.property_id = properties.id 
    AND property_units.occupancy_status = 'مشغول'
  ),
  monthly_revenue = COALESCE((
    SELECT SUM(monthly_rent) FROM contracts 
    WHERE contracts.property_id = properties.id AND contracts.status = 'نشط'
  ), monthly_revenue),
  updated_at = now();

-- 4. إضافة طلبات صيانة بالقيم الصحيحة
INSERT INTO maintenance_requests (property_id, request_number, title, category, priority, description, requested_by, requested_date, status, estimated_cost)
SELECT 
  p.id,
  'MNT-' || to_char(now(), 'YYMM') || '-' || LPAD(ROW_NUMBER() OVER()::text, 4, '0'),
  CASE (ROW_NUMBER() OVER() % 4) WHEN 0 THEN 'عطل المكيف' WHEN 1 THEN 'تسريب مياه' WHEN 2 THEN 'مشكلة إضاءة' ELSE 'صيانة دورية' END,
  CASE (ROW_NUMBER() OVER() % 4) WHEN 0 THEN 'تكييف' WHEN 1 THEN 'سباكة' WHEN 2 THEN 'كهرباء' ELSE 'أخرى' END,
  CASE (ROW_NUMBER() OVER() % 3) WHEN 0 THEN 'عالية' WHEN 1 THEN 'عادية' ELSE 'منخفضة' END,
  'وصف طلب الصيانة',
  'النظام',
  CURRENT_DATE - ((ROW_NUMBER() OVER() * 3) || ' days')::interval,
  CASE (ROW_NUMBER() OVER() % 4) WHEN 0 THEN 'جديد' WHEN 1 THEN 'قيد التنفيذ' WHEN 2 THEN 'مكتمل' ELSE 'جديد' END,
  (ROW_NUMBER() OVER() * 500) + 1000
FROM properties p
WHERE NOT EXISTS (SELECT 1 FROM maintenance_requests mr WHERE mr.property_id = p.id)
LIMIT 6;

-- 5. إنشاء دالة مزامنة الوحدات
CREATE OR REPLACE FUNCTION sync_unit_occupancy_status()
RETURNS TRIGGER AS $$
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

DROP TRIGGER IF EXISTS trigger_sync_unit_occupancy ON contracts;
CREATE TRIGGER trigger_sync_unit_occupancy AFTER INSERT OR UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION sync_unit_occupancy_status();