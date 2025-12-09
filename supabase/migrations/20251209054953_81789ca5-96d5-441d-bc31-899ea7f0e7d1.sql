-- إضافة أعمدة المحتوى المستخرج لجدول disclosure_documents
ALTER TABLE public.disclosure_documents
ADD COLUMN IF NOT EXISTS extracted_content JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS content_summary TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS total_amount NUMERIC DEFAULT NULL,
ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT NULL;