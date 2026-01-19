
-- Fix RLS policy for annual_disclosures to allow beneficiaries to view published disclosures
DROP POLICY IF EXISTS "disclosures_select" ON public.annual_disclosures;

-- Create new policy: staff can see all, beneficiaries can see published only
CREATE POLICY "disclosures_select" ON public.annual_disclosures
FOR SELECT USING (
  -- Staff can see all disclosures
  has_full_read_access()
  OR
  -- Beneficiaries can see published disclosures only
  (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role = 'beneficiary'::app_role
    )
    AND status = 'published'
  )
);
