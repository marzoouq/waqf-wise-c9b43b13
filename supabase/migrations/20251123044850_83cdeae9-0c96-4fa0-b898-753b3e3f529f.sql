-- إصلاح تحذيرات الأمان للمرحلة الرابعة

-- إصلاح الدوال بإضافة search_path
CREATE OR REPLACE FUNCTION generate_voucher_number(voucher_type TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  next_number INTEGER;
  year_part TEXT;
BEGIN
  prefix := CASE voucher_type
    WHEN 'receipt' THEN 'RC'
    WHEN 'payment' THEN 'PV'
    WHEN 'journal' THEN 'JV'
    ELSE 'VC'
  END;
  
  year_part := TO_CHAR(NOW(), 'YY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(voucher_number FROM '[0-9]+$') AS INTEGER)
  ), 0) + 1 INTO next_number
  FROM payment_vouchers
  WHERE voucher_number LIKE prefix || year_part || '%';
  
  RETURN prefix || year_part || '-' || LPAD(next_number::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إصلاح دالة توليد رقم ملف التحويل
CREATE OR REPLACE FUNCTION generate_transfer_file_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  year_part TEXT;
  month_part TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YY');
  month_part := TO_CHAR(NOW(), 'MM');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(file_number FROM '[0-9]+$') AS INTEGER)
  ), 0) + 1 INTO next_number
  FROM bank_transfer_files
  WHERE file_number LIKE 'BTF' || year_part || month_part || '%';
  
  RETURN 'BTF' || year_part || month_part || '-' || LPAD(next_number::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إصلاح دالة update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;