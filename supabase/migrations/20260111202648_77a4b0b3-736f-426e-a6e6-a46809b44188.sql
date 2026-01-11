-- المرحلة 1: إصلاح بيانات قلم الوقف
-- 1.1 تحديث العائد السنوي لقلم الوقف
UPDATE waqf_units 
SET annual_return = 758333.33, updated_at = now()
WHERE code = 'WU-001';

-- 1.2 تصحيح revenue_type للعقارات
UPDATE properties 
SET revenue_type = 'سنوي', updated_at = now()
WHERE id IN (
  '98086981-f25c-492f-9451-cea5070dcf41',
  'da99233c-1845-45b3-a316-3a30b28701d1'
);

-- 1.3 تصحيح إيجار عقار السامر 1
UPDATE properties 
SET monthly_revenue = 8333.33, updated_at = now()
WHERE id = 'b8e5a463-a175-401b-8b7f-9c15672fffe0';

-- المرحلة 2: إصلاح بيانات المستفيدين
-- 2.1 تصحيح total_received بناءً على التوزيعات المدفوعة فقط
UPDATE beneficiaries b
SET total_received = COALESCE((
  SELECT SUM(hd.share_amount)
  FROM heir_distributions hd
  WHERE hd.beneficiary_id = b.id 
  AND hd.status = 'مدفوع'
), 0),
updated_at = now();

-- 2.2 إضافة Trigger لتحديث total_received تلقائياً
CREATE OR REPLACE FUNCTION sync_beneficiary_total_received()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE beneficiaries
  SET 
    total_received = COALESCE((
      SELECT SUM(share_amount)
      FROM heir_distributions
      WHERE beneficiary_id = COALESCE(NEW.beneficiary_id, OLD.beneficiary_id)
      AND status = 'مدفوع'
    ), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.beneficiary_id, OLD.beneficiary_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_beneficiary_total ON heir_distributions;
CREATE TRIGGER trigger_sync_beneficiary_total
AFTER INSERT OR UPDATE OR DELETE ON heir_distributions
FOR EACH ROW
EXECUTE FUNCTION sync_beneficiary_total_received();

-- المرحلة 3: تحسين جدول distributions
-- 3.1 إضافة عمود waqf_unit_id لربط التوزيعات بأقلام الوقف
ALTER TABLE distributions 
ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES waqf_units(id);

-- ربط التوزيعات الحالية بقلم الوقف
UPDATE distributions 
SET waqf_unit_id = '27726628-d3b5-4347-8d94-32c6efe6ac7e'
WHERE waqf_name ILIKE '%الثبيتي%' OR waqf_unit_id IS NULL;

-- 3.2 تحديث distributable_amount
UPDATE distributions
SET distributable_amount = total_amount
WHERE distributable_amount = 0 OR distributable_amount IS NULL;

-- المرحلة 4: ربط الصناديق بأقلام الوقف
UPDATE funds 
SET waqf_unit_id = '27726628-d3b5-4347-8d94-32c6efe6ac7e', updated_at = now()
WHERE waqf_unit_id IS NULL;

-- المرحلة 7: إضافة Trigger لمزامنة العائد السنوي
CREATE OR REPLACE FUNCTION sync_waqf_annual_return()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE waqf_units wu
  SET 
    annual_return = COALESCE((
      SELECT SUM(
        CASE WHEN c.payment_frequency = 'سنوي' THEN c.monthly_rent 
             ELSE c.monthly_rent * 12 
        END
      )
      FROM contracts c
      JOIN properties p ON c.property_id = p.id
      WHERE p.waqf_unit_id = wu.id AND c.status = 'نشط'
    ), 0),
    updated_at = now()
  WHERE wu.id = (
    SELECT p.waqf_unit_id 
    FROM properties p 
    WHERE p.id = COALESCE(NEW.property_id, OLD.property_id)
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_sync_waqf_return ON contracts;
CREATE TRIGGER trigger_sync_waqf_return
AFTER INSERT OR UPDATE OR DELETE ON contracts
FOR EACH ROW
EXECUTE FUNCTION sync_waqf_annual_return();