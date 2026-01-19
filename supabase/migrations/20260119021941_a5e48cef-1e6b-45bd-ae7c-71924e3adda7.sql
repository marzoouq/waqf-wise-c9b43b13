-- المرحلة 1: إضافة UNIQUE constraint لمنع تكرار الوحدات
ALTER TABLE property_units 
ADD CONSTRAINT property_units_property_unit_unique 
UNIQUE (property_id, unit_number);

-- المرحلة 2: حماية البيانات المالية من الحذف

-- 2.1 حماية القروض من الحذف مع المستفيد (تغيير من CASCADE إلى RESTRICT)
ALTER TABLE loans 
DROP CONSTRAINT IF EXISTS loans_beneficiary_id_fkey,
ADD CONSTRAINT loans_beneficiary_id_fkey 
  FOREIGN KEY (beneficiary_id) 
  REFERENCES beneficiaries(id) 
  ON DELETE RESTRICT;

-- 2.2 حماية السندات من فقدان ربط العقد (تغيير من SET NULL إلى RESTRICT)
ALTER TABLE payment_vouchers 
DROP CONSTRAINT IF EXISTS payment_vouchers_contract_id_fkey,
ADD CONSTRAINT payment_vouchers_contract_id_fkey 
  FOREIGN KEY (contract_id) 
  REFERENCES contracts(id) 
  ON DELETE RESTRICT;

-- 2.3 حماية تفاصيل التوزيع من الحذف مع المستفيد
ALTER TABLE distribution_details 
DROP CONSTRAINT IF EXISTS distribution_details_beneficiary_id_fkey,
ADD CONSTRAINT distribution_details_beneficiary_id_fkey 
  FOREIGN KEY (beneficiary_id) 
  REFERENCES beneficiaries(id) 
  ON DELETE RESTRICT;

-- تعليق توضيحي للتوثيق
COMMENT ON CONSTRAINT property_units_property_unit_unique ON property_units IS 'يمنع تكرار رقم الوحدة ضمن نفس العقار - Idempotency';
COMMENT ON CONSTRAINT loans_beneficiary_id_fkey ON loans IS 'يمنع حذف مستفيد له قروض نشطة - RESTRICT';
COMMENT ON CONSTRAINT payment_vouchers_contract_id_fkey ON payment_vouchers IS 'يمنع حذف عقد له سندات - RESTRICT';
COMMENT ON CONSTRAINT distribution_details_beneficiary_id_fkey ON distribution_details IS 'يمنع حذف مستفيد له توزيعات - RESTRICT';