
-- إنشاء دالة حذف آمنة للمستفيدين الوهميين
CREATE OR REPLACE FUNCTION delete_test_beneficiaries(beneficiary_numbers TEXT[])
RETURNS TABLE(deleted_count INTEGER) AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- تعطيل جميع triggers مؤقتاً
  SET session_replication_role = 'replica';
  
  -- حذف المستفيدين
  DELETE FROM beneficiaries 
  WHERE beneficiary_number = ANY(beneficiary_numbers);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  -- إعادة تفعيل triggers
  SET session_replication_role = 'origin';
  
  RETURN QUERY SELECT v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- تنفيذ الحذف
SELECT delete_test_beneficiaries(ARRAY[
  'B-2025-0039', 'B-2025-0042', 'B-2025-0040', 'B-2025-0041',
  'B-2025-0043', 'B-2025-0036', 'B-2025-0037', 'B-2025-0038',
  'B-2025-0024', 'B-2025-0025', 'B-2025-0022', 'B-2025-0026',
  'B-2025-0023'
]);

-- حذف الدالة بعد الاستخدام
DROP FUNCTION IF EXISTS delete_test_beneficiaries(TEXT[]);
