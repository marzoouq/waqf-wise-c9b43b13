-- إصلاح search_path في الدوال لمنع هجمات search path manipulation
-- هذه الدوال تحتاج إضافة SET search_path = public, pg_temp

-- 1. إصلاح دالة update_updated_at إذا كانت موجودة بدون search_path
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at() IS 'تحديث updated_at تلقائياً - SECURITY DEFINER مع search_path آمن';

-- 2. إصلاح دالة handle_updated_at إذا كانت موجودة بدون search_path
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_updated_at() IS 'تحديث updated_at تلقائياً - SECURITY DEFINER مع search_path آمن';

-- 3. التحقق من جميع الدوال وإضافة تعليق للتوثيق
DO $$
DECLARE
  func_record RECORD;
BEGIN
  -- البحث عن جميع الدوال التي تستخدم SECURITY DEFINER
  FOR func_record IN 
    SELECT 
      n.nspname as schema_name,
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as arguments
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.prosecdef = true  -- SECURITY DEFINER
  LOOP
    RAISE NOTICE 'SECURITY DEFINER function found: %.%(%)', 
      func_record.schema_name, 
      func_record.function_name,
      func_record.arguments;
  END LOOP;
END $$;
