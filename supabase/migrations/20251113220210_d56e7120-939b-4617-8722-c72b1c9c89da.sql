-- إضافة حقل رقم المستفيد المحسّن
ALTER TABLE beneficiaries ADD COLUMN IF NOT EXISTS beneficiary_number TEXT UNIQUE;

-- إنشاء sequence لتوليد الأرقام
CREATE SEQUENCE IF NOT EXISTS beneficiary_number_seq START 1;

-- دالة لتوليد رقم المستفيد
CREATE OR REPLACE FUNCTION generate_beneficiary_number()
RETURNS TEXT AS $$
DECLARE
  current_year TEXT;
  next_num TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM NOW())::TEXT;
  next_num := LPAD(nextval('beneficiary_number_seq')::TEXT, 4, '0');
  RETURN 'B-' || current_year || '-' || next_num;
END;
$$ LANGUAGE plpgsql;

-- إنشاء trigger لتوليد الرقم تلقائياً عند الإدخال
CREATE OR REPLACE FUNCTION set_beneficiary_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.beneficiary_number IS NULL THEN
    NEW.beneficiary_number := generate_beneficiary_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_beneficiary_number ON beneficiaries;
CREATE TRIGGER trigger_set_beneficiary_number
  BEFORE INSERT ON beneficiaries
  FOR EACH ROW
  EXECUTE FUNCTION set_beneficiary_number();

-- تحديث السجلات الحالية التي ليس لديها رقم مستفيد
DO $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN 
    SELECT id FROM beneficiaries WHERE beneficiary_number IS NULL ORDER BY created_at
  LOOP
    UPDATE beneficiaries 
    SET beneficiary_number = generate_beneficiary_number() 
    WHERE id = rec.id;
  END LOOP;
END $$;