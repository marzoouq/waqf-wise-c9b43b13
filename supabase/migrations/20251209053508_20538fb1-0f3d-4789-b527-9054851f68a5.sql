-- إنشاء جدول ربط المستندات بالإفصاح السنوي
CREATE TABLE public.disclosure_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  disclosure_id UUID NOT NULL REFERENCES public.annual_disclosures(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('فاتورة_خدمات', 'صيانة', 'زكاة_ضرائب', 'تقرير_مالي', 'خدمات_محاسبية', 'مصاريف_عامة', 'اقفال_سنوي')),
  file_path TEXT NOT NULL,
  file_size INTEGER,
  description TEXT,
  fiscal_year INTEGER NOT NULL,
  uploaded_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.disclosure_documents ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول - الناظر والمشرف يمكنهم الإدارة الكاملة
CREATE POLICY "Staff can manage disclosure documents"
ON public.disclosure_documents
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('admin', 'nazer', 'accountant', 'archivist')
  )
);

-- الورثة يمكنهم العرض فقط
CREATE POLICY "Heirs can view disclosure documents"
ON public.disclosure_documents
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('waqf_heir', 'beneficiary')
  )
);

-- إضافة للنشر الفوري
ALTER PUBLICATION supabase_realtime ADD TABLE public.disclosure_documents;

-- فهرس للبحث السريع
CREATE INDEX idx_disclosure_documents_disclosure_id ON public.disclosure_documents(disclosure_id);
CREATE INDEX idx_disclosure_documents_fiscal_year ON public.disclosure_documents(fiscal_year);