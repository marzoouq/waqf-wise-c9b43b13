-- حذف الدالة calculate_request_sla()
DROP FUNCTION IF EXISTS calculate_request_sla() CASCADE;

-- جعل request_type_id nullable
ALTER TABLE beneficiary_requests
ALTER COLUMN request_type_id DROP NOT NULL;

-- الحصول على أول نوع طلب أو إنشاء واحد افتراضي
DO $$
DECLARE
  default_request_type_id UUID;
BEGIN
  -- Get first request type ID
  SELECT id INTO default_request_type_id FROM request_types LIMIT 1;
  
  -- تحديث الصفوف التي تشير إلى نوع طلب غير موجود
  UPDATE beneficiary_requests
  SET request_type_id = default_request_type_id
  WHERE request_type_id IS NOT NULL 
    AND request_type_id NOT IN (SELECT id FROM request_types);
    
  -- تحديث الصفوف NULL
  UPDATE beneficiary_requests
  SET request_type_id = default_request_type_id
  WHERE request_type_id IS NULL;
END $$;

-- الآن إضافة foreign key
ALTER TABLE beneficiary_requests
DROP CONSTRAINT IF EXISTS beneficiary_requests_request_type_id_fkey;

ALTER TABLE beneficiary_requests
ADD CONSTRAINT beneficiary_requests_request_type_id_fkey
FOREIGN KEY (request_type_id)
REFERENCES request_types(id)
ON DELETE SET NULL;