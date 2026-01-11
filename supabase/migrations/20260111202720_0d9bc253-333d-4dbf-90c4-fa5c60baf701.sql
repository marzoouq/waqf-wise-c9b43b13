-- إصلاح تحذيرات الأمان: تعيين search_path للدوال
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;