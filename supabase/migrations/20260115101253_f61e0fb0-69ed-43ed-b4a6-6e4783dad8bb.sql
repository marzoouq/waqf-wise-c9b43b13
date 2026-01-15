-- Fix: governance_board_members table security
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view board members" ON public.governance_board_members;
DROP POLICY IF EXISTS "governance_board_members_select" ON public.governance_board_members;
DROP POLICY IF EXISTS "Public can view board members" ON public.governance_board_members;

-- Create secure policy - only authenticated users can view
CREATE POLICY "Authenticated users can view board members"
ON public.governance_board_members
FOR SELECT
TO authenticated
USING (true);

-- Fix: emergency_aid_requests table security
-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can view emergency aid requests" ON public.emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_requests_select" ON public.emergency_aid_requests;
DROP POLICY IF EXISTS "Public can view emergency aid requests" ON public.emergency_aid_requests;

-- Create secure policy - staff can view all, beneficiaries can view their own
CREATE POLICY "Staff can view all emergency aid requests"
ON public.emergency_aid_requests
FOR SELECT
TO authenticated
USING (
  public.is_staff()
  OR public.has_role(auth.uid(), 'nazer')
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'waqf_heir')
);

CREATE POLICY "Beneficiaries can view own emergency aid requests"
ON public.emergency_aid_requests
FOR SELECT
TO authenticated
USING (
  beneficiary_id IN (
    SELECT id FROM public.beneficiaries WHERE user_id = auth.uid()
  )
);