-- تفعيل إضافات Cron و HTTP
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- جدول إصدارات المستندات
CREATE TABLE IF NOT EXISTS public.document_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  change_description TEXT,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_current BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON public.document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_current ON public.document_versions(document_id, is_current) WHERE is_current = true;

-- تفعيل RLS
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "document_versions_select_policy" ON public.document_versions
  FOR SELECT USING (true);

CREATE POLICY "document_versions_insert_policy" ON public.document_versions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "document_versions_update_policy" ON public.document_versions
  FOR UPDATE USING (true);

-- جدول التقارير المجدولة
CREATE TABLE IF NOT EXISTS public.scheduled_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_name TEXT NOT NULL,
  report_type TEXT NOT NULL,
  schedule_cron TEXT NOT NULL DEFAULT '0 8 * * 1',
  recipients JSONB DEFAULT '[]'::jsonb,
  filters JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scheduled_reports_select_policy" ON public.scheduled_reports
  FOR SELECT USING (true);

CREATE POLICY "scheduled_reports_all_policy" ON public.scheduled_reports
  FOR ALL USING (true);

-- دالة لإنشاء إصدار جديد للمستند
CREATE OR REPLACE FUNCTION public.create_document_version()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا تغير مسار الملف، أنشئ إصدار جديد
  IF OLD.file_path IS DISTINCT FROM NEW.file_path THEN
    -- إلغاء الإصدار الحالي
    UPDATE public.document_versions
    SET is_current = false
    WHERE document_id = NEW.id AND is_current = true;
    
    -- إنشاء إصدار جديد
    INSERT INTO public.document_versions (
      document_id,
      version_number,
      file_path,
      change_description,
      is_current
    )
    SELECT 
      NEW.id,
      COALESCE(MAX(version_number), 0) + 1,
      NEW.file_path,
      'تحديث الملف',
      true
    FROM public.document_versions
    WHERE document_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ربط الدالة بجدول المستندات
DROP TRIGGER IF EXISTS document_version_trigger ON public.documents;
CREATE TRIGGER document_version_trigger
  AFTER UPDATE ON public.documents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_document_version();