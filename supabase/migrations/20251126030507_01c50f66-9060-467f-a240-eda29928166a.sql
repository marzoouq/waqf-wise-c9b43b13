-- المرحلة 14: إكمال نظام العائلات والمستفيدين المتقدم

-- 1. إنشاء جدول أعضاء العائلة (family_members)
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  relationship_to_head TEXT NOT NULL,
  is_dependent BOOLEAN DEFAULT true,
  priority_level INTEGER DEFAULT 1,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, beneficiary_id)
);

-- 2. إضافة فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_beneficiary_id ON public.family_members(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_family_members_relationship ON public.family_members(relationship_to_head);

-- 3. تحديث trigger للتوقيت التلقائي
DROP TRIGGER IF EXISTS update_family_members_updated_at ON public.family_members;
CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 4. RLS Policies لجدول family_members
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Staff can view all family members" ON public.family_members;
CREATE POLICY "Staff can view all family members"
  ON public.family_members
  FOR SELECT
  USING (is_staff());

DROP POLICY IF EXISTS "Admin can insert family members" ON public.family_members;
CREATE POLICY "Admin can insert family members"
  ON public.family_members
  FOR INSERT
  WITH CHECK (is_admin_or_nazer());

DROP POLICY IF EXISTS "Admin can update family members" ON public.family_members;
CREATE POLICY "Admin can update family members"
  ON public.family_members
  FOR UPDATE
  USING (is_admin_or_nazer());

DROP POLICY IF EXISTS "Admin can delete family members" ON public.family_members;
CREATE POLICY "Admin can delete family members"
  ON public.family_members
  FOR DELETE
  USING (is_admin_or_nazer());

-- 5. دالة لتحديث عدد أفراد العائلة تلقائياً
CREATE OR REPLACE FUNCTION update_family_member_count()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE families
  SET 
    total_members = (
      SELECT COUNT(*) 
      FROM family_members 
      WHERE family_id = COALESCE(NEW.family_id, OLD.family_id)
      AND left_at IS NULL
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.family_id, OLD.family_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 6. Trigger لتحديث عدد الأفراد
DROP TRIGGER IF EXISTS update_family_count_on_member_change ON public.family_members;
CREATE TRIGGER update_family_count_on_member_change
  AFTER INSERT OR UPDATE OR DELETE ON public.family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_family_member_count();

-- 7. دالة البحث المتقدم
CREATE OR REPLACE FUNCTION search_beneficiaries_advanced(
  p_full_name TEXT DEFAULT NULL,
  p_national_id TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_tribe TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL,
  p_marital_status TEXT DEFAULT NULL,
  p_priority_level INTEGER DEFAULT NULL,
  p_family_id UUID DEFAULT NULL,
  p_has_family BOOLEAN DEFAULT NULL,
  p_min_income NUMERIC DEFAULT NULL,
  p_max_income NUMERIC DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  national_id TEXT,
  phone TEXT,
  category TEXT,
  status TEXT,
  family_id UUID,
  priority_level INTEGER,
  monthly_income NUMERIC
)
SECURITY DEFINER
SET search_path = public, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.full_name,
    b.national_id,
    b.phone,
    b.category,
    b.status,
    b.family_id,
    b.priority_level,
    b.monthly_income
  FROM beneficiaries b
  WHERE 
    (p_full_name IS NULL OR b.full_name ILIKE '%' || p_full_name || '%')
    AND (p_national_id IS NULL OR b.national_id LIKE p_national_id || '%')
    AND (p_phone IS NULL OR b.phone LIKE '%' || p_phone || '%')
    AND (p_category IS NULL OR b.category = p_category)
    AND (p_status IS NULL OR b.status = p_status)
    AND (p_tribe IS NULL OR b.tribe ILIKE '%' || p_tribe || '%')
    AND (p_city IS NULL OR b.city ILIKE '%' || p_city || '%')
    AND (p_gender IS NULL OR b.gender = p_gender)
    AND (p_marital_status IS NULL OR b.marital_status = p_marital_status)
    AND (p_priority_level IS NULL OR b.priority_level = p_priority_level)
    AND (p_family_id IS NULL OR b.family_id = p_family_id)
    AND (p_has_family IS NULL OR (p_has_family = true AND b.family_id IS NOT NULL) OR (p_has_family = false AND b.family_id IS NULL))
    AND (p_min_income IS NULL OR b.monthly_income >= p_min_income)
    AND (p_max_income IS NULL OR b.monthly_income <= p_max_income);
END;
$$;