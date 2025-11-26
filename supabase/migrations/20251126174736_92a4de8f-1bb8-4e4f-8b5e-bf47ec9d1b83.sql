-- إضافة حقول OCR لجدول invoices
ALTER TABLE public.invoices 
ADD COLUMN IF NOT EXISTS source_image_url TEXT,
ADD COLUMN IF NOT EXISTS ocr_extracted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ocr_confidence_score NUMERIC CHECK (ocr_confidence_score >= 0 AND ocr_confidence_score <= 100),
ADD COLUMN IF NOT EXISTS ocr_processed_at TIMESTAMPTZ;

-- إنشاء جدول لحفظ تصحيحات OCR للتعلم
CREATE TABLE IF NOT EXISTS public.ocr_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  extracted_value TEXT,
  corrected_value TEXT NOT NULL,
  confidence_score NUMERIC,
  corrected_by UUID,
  corrected_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_invoices_ocr_extracted ON public.invoices(ocr_extracted);
CREATE INDEX IF NOT EXISTS idx_invoices_source_image ON public.invoices(source_image_url) WHERE source_image_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ocr_corrections_invoice ON public.ocr_corrections(invoice_id);

-- RLS policies لجدول ocr_corrections
ALTER TABLE public.ocr_corrections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "financial_staff_can_read_ocr_corrections" 
ON public.ocr_corrections FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant')
  )
);

CREATE POLICY "financial_staff_can_insert_ocr_corrections" 
ON public.ocr_corrections FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant')
  )
);

COMMENT ON COLUMN public.invoices.source_image_url IS 'رابط الصورة الأصلية للفاتورة في Storage';
COMMENT ON COLUMN public.invoices.ocr_extracted IS 'هل تم استخراج البيانات من صورة باستخدام OCR';
COMMENT ON COLUMN public.invoices.ocr_confidence_score IS 'نسبة الثقة في البيانات المستخرجة (0-100)';
COMMENT ON COLUMN public.invoices.ocr_processed_at IS 'تاريخ ووقت معالجة OCR';
COMMENT ON TABLE public.ocr_corrections IS 'سجل التصحيحات على البيانات المستخرجة بواسطة OCR للتعلم وتحسين الدقة';