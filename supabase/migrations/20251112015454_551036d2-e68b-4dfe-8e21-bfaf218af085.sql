-- Fix activities table RLS policies to restrict access to admins only
DROP POLICY IF EXISTS "Allow authenticated read on activities" ON public.activities;
DROP POLICY IF EXISTS "Allow authenticated insert on activities" ON public.activities;

-- Only admins can view all activities
CREATE POLICY "Admins can view all activities"
ON public.activities FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert activities (for logging purposes)
CREATE POLICY "System can insert activities"
ON public.activities FOR INSERT
TO authenticated
WITH CHECK (true);