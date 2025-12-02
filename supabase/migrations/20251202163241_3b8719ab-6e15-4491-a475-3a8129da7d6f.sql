-- إضافة عمود resolution_notes لجدول system_alerts
ALTER TABLE system_alerts 
ADD COLUMN IF NOT EXISTS resolution_notes TEXT;