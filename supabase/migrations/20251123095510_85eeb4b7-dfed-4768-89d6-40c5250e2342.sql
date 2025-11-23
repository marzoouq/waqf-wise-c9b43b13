-- المرحلة الأولى: إضافة contract_id إلى جدول payments
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL;

-- إضافة index لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_payments_contract_id ON payments(contract_id);

-- المرحلة الثانية: إنشاء view لعرض معلومات السندات مع العقود
CREATE OR REPLACE VIEW payments_with_contract_details AS
SELECT 
  p.*,
  c.contract_number,
  c.tenant_name,
  c.tenant_phone,
  c.tenant_id_number,
  prop.name as property_name,
  prop.location as property_location,
  prop.type as property_type
FROM payments p
LEFT JOIN contracts c ON p.contract_id = c.id
LEFT JOIN properties prop ON c.property_id = prop.id;

-- المرحلة الثالثة: إنشاء function لتحديث الضرائب تلقائياً
CREATE OR REPLACE FUNCTION update_rental_payments_tax()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_updated_count INTEGER := 0;
BEGIN
  -- إذا تم تحديث نسبة الضريبة
  IF OLD.tax_percentage IS DISTINCT FROM NEW.tax_percentage THEN
    -- تحديث جميع المدفوعات المرتبطة بعقود هذا العقار
    WITH updated_payments AS (
      UPDATE rental_payments rp
      SET 
        tax_percentage = NEW.tax_percentage,
        tax_amount = ROUND((rp.amount_due * NEW.tax_percentage) / (100 + NEW.tax_percentage), 2),
        net_amount = ROUND(rp.amount_due - ((rp.amount_due * NEW.tax_percentage) / (100 + NEW.tax_percentage)), 2),
        updated_at = now()
      FROM contracts c
      WHERE rp.contract_id = c.id
        AND c.property_id = NEW.id
        AND rp.status IN ('معلق', 'متأخر') -- فقط الدفعات المعلقة والمتأخرة
      RETURNING rp.id
    )
    SELECT COUNT(*) INTO v_updated_count FROM updated_payments;
    
    -- إضافة سجل تدقيق
    INSERT INTO audit_logs (
      action_type,
      table_name,
      record_id,
      description,
      old_values,
      new_values,
      user_id,
      user_email
    ) VALUES (
      'UPDATE',
      'properties',
      NEW.id::TEXT,
      format('تحديث نسبة الضريبة من %s%% إلى %s%% - تم تحديث %s دفعة إيجار', 
        OLD.tax_percentage, NEW.tax_percentage, v_updated_count),
      jsonb_build_object('tax_percentage', OLD.tax_percentage),
      jsonb_build_object('tax_percentage', NEW.tax_percentage, 'updated_payments', v_updated_count),
      auth.uid(),
      (SELECT email FROM auth.users WHERE id = auth.uid())
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- إنشاء Trigger لتحديث الضرائب تلقائياً
DROP TRIGGER IF EXISTS trigger_update_rental_payments_tax ON properties;
CREATE TRIGGER trigger_update_rental_payments_tax
AFTER UPDATE OF tax_percentage ON properties
FOR EACH ROW
EXECUTE FUNCTION update_rental_payments_tax();