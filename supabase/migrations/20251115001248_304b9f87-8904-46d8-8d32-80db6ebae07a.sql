-- المرحلة الرابعة: تحسينات قاعدة البيانات

-- 1. إضافة جدول لكلمات المرور المسربة (Leaked Passwords)
CREATE TABLE IF NOT EXISTS public.leaked_password_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  is_leaked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS للخصوصية
ALTER TABLE public.leaked_password_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own checks"
  ON public.leaked_password_checks FOR SELECT
  USING (auth.uid() = user_id);

-- 2. إضافة جدول لـ Custom Reports
CREATE TABLE IF NOT EXISTS public.custom_report_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  configuration JSONB NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.custom_report_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own templates"
  ON public.custom_report_templates FOR SELECT
  USING (auth.uid() = created_by OR is_public = true);

CREATE POLICY "Users can create templates"
  ON public.custom_report_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their templates"
  ON public.custom_report_templates FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their templates"
  ON public.custom_report_templates FOR DELETE
  USING (auth.uid() = created_by);

-- 3. إضافة جدول للـ Multi-language
CREATE TABLE IF NOT EXISTS public.translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  ar TEXT NOT NULL,
  en TEXT,
  fr TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read translations"
  ON public.translations FOR SELECT
  USING (true);

-- 4. إضافة جدول لـ Advanced Search History
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_type TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their search history"
  ON public.search_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add to search history"
  ON public.search_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index للبحث السريع
CREATE INDEX IF NOT EXISTS idx_search_history_user_created ON public.search_history(user_id, created_at DESC);

-- 5. Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_custom_reports_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_custom_report_templates_timestamp
  BEFORE UPDATE ON public.custom_report_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_reports_timestamp();

CREATE TRIGGER update_translations_timestamp
  BEFORE UPDATE ON public.translations
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_reports_timestamp();

-- 6. إضافة indexes للأداء
CREATE INDEX IF NOT EXISTS idx_leaked_password_user ON public.leaked_password_checks(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_reports_user ON public.custom_report_templates(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_custom_reports_public ON public.custom_report_templates(is_public, created_at DESC) WHERE is_public = true;