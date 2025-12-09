-- إضافة أعمدة التحكم التفصيلي بالأرشيف
ALTER TABLE public.beneficiary_visibility_settings
ADD COLUMN IF NOT EXISTS show_archive_contracts boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_archive_legal_docs boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_archive_financial_reports boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS show_archive_meeting_minutes boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_download_documents boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS allow_preview_documents boolean DEFAULT true;