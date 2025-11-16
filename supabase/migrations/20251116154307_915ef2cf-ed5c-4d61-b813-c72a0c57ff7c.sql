-- إصلاح search_path للدوال
DO $$ 
BEGIN
  -- تحديث update_tribes_updated_at
  EXECUTE 'ALTER FUNCTION update_tribes_updated_at() SET search_path = public';
EXCEPTION 
  WHEN undefined_function THEN NULL;
END $$;

DO $$ 
BEGIN
  -- تحديث update_updated_at_column
  EXECUTE 'ALTER FUNCTION update_updated_at_column() SET search_path = public';
EXCEPTION 
  WHEN undefined_function THEN NULL;
END $$;
