-- إضافة حقل عدد الأدوار لجدول العقارات
ALTER TABLE properties ADD COLUMN IF NOT EXISTS floors INTEGER DEFAULT 1;

-- تحديث العقارات الموجودة لتكون لها قيمة افتراضية
UPDATE properties SET floors = 1 WHERE floors IS NULL;