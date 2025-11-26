-- المرحلة 13 و 14: إكمال النظام (نسخة نهائية مبسطة)

-- 1. إضافة أعمدة لجدول beneficiaries
ALTER TABLE public.beneficiaries 
  ADD COLUMN IF NOT EXISTS family_id UUID REFERENCES public.families(id),
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_payments DECIMAL(15,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pending_amount DECIMAL(15,2) DEFAULT 0;

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_beneficiaries_family_id ON public.beneficiaries(family_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_verification ON public.beneficiaries(verification_status);

-- 3. جدول تاريخ التغييرات
CREATE TABLE IF NOT EXISTS public.beneficiary_changes_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT,
  changed_by UUID REFERENCES auth.users(id),
  changed_by_name TEXT,
  changed_by_role TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_beneficiary_changes_beneficiary ON public.beneficiary_changes_log(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_changes_date ON public.beneficiary_changes_log(created_at DESC);

ALTER TABLE public.beneficiary_changes_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view change logs" ON public.beneficiary_changes_log;
DROP POLICY IF EXISTS "Staff can insert change logs" ON public.beneficiary_changes_log;

CREATE POLICY "Staff can view change logs"
  ON public.beneficiary_changes_log FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'nazer'::app_role) OR
    public.has_role(auth.uid(), 'accountant'::app_role)
  );

CREATE POLICY "Staff can insert change logs"
  ON public.beneficiary_changes_log FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::app_role) OR
    public.has_role(auth.uid(), 'nazer'::app_role) OR
    public.has_role(auth.uid(), 'accountant'::app_role) OR
    public.has_role(auth.uid(), 'archivist'::app_role)
  );

-- 4. دالة البحث المتقدم
CREATE OR REPLACE FUNCTION public.search_beneficiaries_advanced(
  search_text TEXT DEFAULT NULL,
  search_category TEXT DEFAULT NULL,
  search_status TEXT DEFAULT NULL,
  search_tribe TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  full_name TEXT,
  national_id TEXT,
  category TEXT,
  status TEXT,
  phone TEXT,
  tribe TEXT,
  total_received DECIMAL
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    b.id,
    b.full_name,
    b.national_id,
    b.category,
    b.status,
    b.phone,
    b.tribe,
    b.total_received
  FROM public.beneficiaries b
  WHERE
    (search_text IS NULL OR 
     b.full_name ILIKE '%' || search_text || '%' OR
     b.national_id ILIKE '%' || search_text || '%' OR
     b.phone ILIKE '%' || search_text || '%')
    AND (search_category IS NULL OR b.category = search_category)
    AND (search_status IS NULL OR b.status = search_status)
    AND (search_tribe IS NULL OR b.tribe = search_tribe)
  ORDER BY b.created_at DESC
  LIMIT 100;
$$;

-- 5. منح صلاحيات للمستخدم الأول
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id FROM auth.users ORDER BY created_at ASC LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role) VALUES 
      (first_user_id, 'admin'::app_role),
      (first_user_id, 'nazer'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;