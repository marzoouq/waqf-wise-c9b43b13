-- Fix 1: Add 'pending' status to loans check constraint
ALTER TABLE public.loans DROP CONSTRAINT IF EXISTS loans_status_check;
ALTER TABLE public.loans ADD CONSTRAINT loans_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'paid'::text, 'defaulted'::text, 'cancelled'::text]));

-- Fix 2: Add status column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS status text DEFAULT 'completed';
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check 
  CHECK (status = ANY (ARRAY['pending'::text, 'completed'::text, 'cancelled'::text, 'failed'::text]));

-- Fix 3: Add file_size_bytes column to documents (copy from file_size)
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS file_size_bytes bigint;
UPDATE public.documents SET file_size_bytes = 
  CASE 
    WHEN file_size ~ '^\d+$' THEN file_size::bigint
    ELSE NULL
  END
WHERE file_size_bytes IS NULL;

-- Fix 4: Add name_ar and name_en columns to request_types
ALTER TABLE public.request_types ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE public.request_types ADD COLUMN IF NOT EXISTS name_en text;

-- Update existing data with Arabic names
UPDATE public.request_types 
SET name_ar = name, name_en = name
WHERE name_ar IS NULL;

-- Make name_ar required
ALTER TABLE public.request_types ALTER COLUMN name_ar SET NOT NULL;

-- Fix 5: Create payment_requires_approval function
CREATE OR REPLACE FUNCTION public.payment_requires_approval(p_amount numeric)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_approval_threshold numeric;
BEGIN
  -- Get approval threshold from system settings (default 10000)
  SELECT COALESCE(
    (SELECT value::numeric FROM system_settings WHERE key = 'payment_approval_threshold'),
    10000
  ) INTO v_approval_threshold;
  
  -- Return true if amount exceeds threshold
  RETURN p_amount > v_approval_threshold;
END;
$$;

COMMENT ON FUNCTION public.payment_requires_approval IS 'تحقق مما إذا كان المبلغ يتطلب موافقة بناءً على حد الموافقة';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.payment_requires_approval TO authenticated;