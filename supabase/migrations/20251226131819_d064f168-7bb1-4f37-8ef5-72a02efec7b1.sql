-- إضافة عمود لحفظ رابط ملف عقد منصة إيجار
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS ejar_document_url TEXT,
ADD COLUMN IF NOT EXISTS ejar_document_name TEXT;