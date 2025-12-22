-- إنشاء دالة increment_field لتحديث أرصدة المستفيدين
CREATE OR REPLACE FUNCTION public.increment_field(
  row_id UUID,
  field_name TEXT,
  increment_value NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  result NUMERIC;
BEGIN
  -- التحقق من صحة اسم الحقل (للأمان)
  IF field_name NOT IN ('total_received', 'account_balance', 'pending_amount', 'total_payments') THEN
    RAISE EXCEPTION 'Invalid field name: %', field_name;
  END IF;
  
  EXECUTE format('
    UPDATE beneficiaries 
    SET %I = COALESCE(%I, 0) + $1,
        updated_at = now()
    WHERE id = $2 
    RETURNING %I', field_name, field_name, field_name)
  INTO result
  USING increment_value, row_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- منح الصلاحيات للوظيفة
GRANT EXECUTE ON FUNCTION public.increment_field(UUID, TEXT, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_field(UUID, TEXT, NUMERIC) TO service_role;

COMMENT ON FUNCTION public.increment_field IS 'تحديث حقل رقمي بالإضافة للقيمة الحالية في جدول المستفيدين';