-- إضافة خيار إظهار الشعار في PDF
ALTER TABLE waqf_branding 
ADD COLUMN IF NOT EXISTS show_logo_in_pdf BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_stamp_in_pdf BOOLEAN DEFAULT true;