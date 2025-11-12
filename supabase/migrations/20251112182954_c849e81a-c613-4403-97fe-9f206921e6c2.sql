-- ==========================================
-- المرحلة 2: أقلام الوقف (Waqf Units)
-- ==========================================

-- 1. إنشاء جدول أقلام الوقف
CREATE TABLE IF NOT EXISTS public.waqf_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  waqf_type TEXT CHECK (waqf_type IN ('عقار', 'نقدي', 'أسهم', 'مشروع')),
  location TEXT,
  acquisition_date DATE,
  acquisition_value DECIMAL(15,2),
  current_value DECIMAL(15,2),
  annual_return DECIMAL(15,2) DEFAULT 0,
  documents JSONB,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. إنشاء Indexes
CREATE INDEX IF NOT EXISTS idx_waqf_units_code ON public.waqf_units(code);
CREATE INDEX IF NOT EXISTS idx_waqf_units_type ON public.waqf_units(waqf_type);
CREATE INDEX IF NOT EXISTS idx_waqf_units_active ON public.waqf_units(is_active);

-- 3. تفعيل RLS
ALTER TABLE public.waqf_units ENABLE ROW LEVEL SECURITY;

-- 4. سياسات RLS
CREATE POLICY "Authenticated users can view waqf units" ON public.waqf_units
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert waqf units" ON public.waqf_units
  FOR INSERT TO authenticated 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update waqf units" ON public.waqf_units
  FOR UPDATE TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete waqf units" ON public.waqf_units
  FOR DELETE TO authenticated 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 5. ربط العقارات بأقلام الوقف
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES public.waqf_units(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_waqf_unit ON public.properties(waqf_unit_id);

-- 6. ربط الصناديق بأقلام الوقف
ALTER TABLE public.funds 
ADD COLUMN IF NOT EXISTS waqf_unit_id UUID REFERENCES public.waqf_units(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_funds_waqf_unit ON public.funds(waqf_unit_id);

-- 7. Function لتوليد كود القلم تلقائياً
CREATE OR REPLACE FUNCTION public.generate_waqf_unit_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_number INTEGER;
  type_prefix TEXT;
BEGIN
  -- تحديد بادئة حسب النوع
  type_prefix := CASE NEW.waqf_type
    WHEN 'عقار' THEN 'RE'
    WHEN 'نقدي' THEN 'CS'
    WHEN 'أسهم' THEN 'ST'
    WHEN 'مشروع' THEN 'PR'
    ELSE 'WU'
  END;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM LENGTH(type_prefix) + 2) AS INTEGER)), 0) + 1
  INTO next_number
  FROM waqf_units
  WHERE code LIKE type_prefix || '-%';
  
  NEW.code := type_prefix || '-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_generate_waqf_unit_code
  BEFORE INSERT ON public.waqf_units
  FOR EACH ROW
  WHEN (NEW.code IS NULL OR NEW.code = '')
  EXECUTE FUNCTION public.generate_waqf_unit_code();

-- 8. Trigger لتحديث updated_at
CREATE TRIGGER tr_update_waqf_units_updated_at
  BEFORE UPDATE ON public.waqf_units
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();