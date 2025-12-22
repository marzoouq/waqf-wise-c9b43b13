
-- إنشاء جدول ocr_processing_log المفقود
CREATE TABLE IF NOT EXISTS public.ocr_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  attachment_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  extracted_text TEXT,
  confidence_score NUMERIC(5,2),
  processing_time_ms INTEGER,
  processed_by UUID,
  error_message TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.ocr_processing_log ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول
CREATE POLICY "Admins can manage ocr_processing_log" ON public.ocr_processing_log
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Archivists can view and insert ocr_processing_log" ON public.ocr_processing_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'archivist'));

CREATE POLICY "Archivists can insert ocr_processing_log" ON public.ocr_processing_log
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'archivist'));

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_ocr_processing_log_document_id ON public.ocr_processing_log(document_id);
CREATE INDEX IF NOT EXISTS idx_ocr_processing_log_status ON public.ocr_processing_log(status);

COMMENT ON TABLE public.ocr_processing_log IS 'سجل عمليات OCR لاستخراج النصوص من المستندات';
