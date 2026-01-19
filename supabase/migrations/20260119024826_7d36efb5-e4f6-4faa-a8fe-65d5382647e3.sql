-- إصلاح search_path للدالة الجديدة
CREATE OR REPLACE FUNCTION public.extract_date_immutable(ts timestamptz)
RETURNS date
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT ts::date;
$$;