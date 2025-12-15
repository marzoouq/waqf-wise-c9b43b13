-- Fix: Restrict request_types table to authenticated users only
-- This prevents unauthenticated users from viewing internal business processes

-- Drop existing public read policy if exists
DROP POLICY IF EXISTS "Anyone can view request types" ON public.request_types;
DROP POLICY IF EXISTS "Public can view request types" ON public.request_types;
DROP POLICY IF EXISTS "request_types_public_select" ON public.request_types;

-- Create policy that requires authentication
CREATE POLICY "Authenticated users can view request types"
ON public.request_types
FOR SELECT
USING (auth.uid() IS NOT NULL);