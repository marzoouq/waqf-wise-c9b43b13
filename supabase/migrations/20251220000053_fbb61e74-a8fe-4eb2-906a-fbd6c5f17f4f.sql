-- حذف الدالة القديمة وإنشاء دالة جديدة بمعامل مختلف
DROP FUNCTION IF EXISTS public.analyze_table(text);

CREATE OR REPLACE FUNCTION public.analyze_table(p_table_name TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- التحقق من صحة اسم الجدول
  IF p_table_name IS NULL OR p_table_name = '' THEN
    RAISE EXCEPTION 'اسم الجدول مطلوب';
  END IF;
  
  -- التحقق من وجود الجدول
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND tables.table_name = p_table_name
  ) THEN
    RAISE EXCEPTION 'الجدول % غير موجود', p_table_name;
  END IF;
  
  -- تنفيذ ANALYZE على الجدول
  EXECUTE format('ANALYZE public.%I', p_table_name);
END;
$$;