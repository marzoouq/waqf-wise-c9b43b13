-- دالة للحصول على رقم المستفيد
CREATE OR REPLACE FUNCTION public.get_beneficiary_number(ben_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT beneficiary_number
  FROM public.beneficiaries
  WHERE id = ben_id
  LIMIT 1;
$$;