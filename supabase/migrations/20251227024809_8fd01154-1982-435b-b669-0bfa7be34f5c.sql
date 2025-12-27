-- إنشاء جدول إعدادات الختم والتوقيع للوقف
CREATE TABLE public.waqf_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stamp_image_url TEXT,
  signature_image_url TEXT,
  nazer_name TEXT DEFAULT 'ناظر الوقف',
  waqf_logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.waqf_branding ENABLE ROW LEVEL SECURITY;

-- السياسات: الجميع يمكنهم القراءة (للتقارير)
CREATE POLICY "Anyone can view waqf branding"
  ON public.waqf_branding
  FOR SELECT
  USING (true);

-- فقط المسؤولين والناظر يمكنهم التعديل
CREATE POLICY "Admin and nazer can update waqf branding"
  ON public.waqf_branding
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'nazer')
    )
  );

-- فقط المسؤولين يمكنهم الإضافة
CREATE POLICY "Admin can insert waqf branding"
  ON public.waqf_branding
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'nazer')
    )
  );

-- إضافة سجل افتراضي
INSERT INTO public.waqf_branding (nazer_name) VALUES ('ناظر الوقف');

-- تحديث trigger
CREATE OR REPLACE FUNCTION public.update_waqf_branding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_waqf_branding_updated_at
  BEFORE UPDATE ON public.waqf_branding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_waqf_branding_updated_at();