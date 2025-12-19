-- إنشاء دالة analyze_table RPC
-- ================================================

CREATE OR REPLACE FUNCTION public.analyze_table(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- التحقق من صحة اسم الجدول
  IF table_name IS NULL OR table_name = '' THEN
    RAISE EXCEPTION 'اسم الجدول مطلوب';
  END IF;
  
  -- التحقق من وجود الجدول
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = analyze_table.table_name
  ) THEN
    RAISE EXCEPTION 'الجدول % غير موجود', table_name;
  END IF;
  
  -- تنفيذ ANALYZE على الجدول
  EXECUTE format('ANALYZE public.%I', table_name);
END;
$$;

-- منح الصلاحيات للمستخدمين المصادق عليهم
GRANT EXECUTE ON FUNCTION public.analyze_table(text) TO authenticated;