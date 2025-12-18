-- إصلاح search_path للدالة
CREATE OR REPLACE FUNCTION public.owns_beneficiary(p_beneficiary_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.beneficiaries b
    WHERE b.id = p_beneficiary_id 
    AND b.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;