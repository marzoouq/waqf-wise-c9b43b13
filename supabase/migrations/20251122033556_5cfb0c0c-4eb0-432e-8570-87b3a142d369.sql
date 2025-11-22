-- إضافة حقول جديدة لجدول properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS tax_percentage numeric DEFAULT 15,
ADD COLUMN IF NOT EXISTS shop_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS apartment_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS revenue_type text DEFAULT 'شهري' CHECK (revenue_type IN ('شهري', 'سنوي'));

-- تحديث أنواع العقارات الموجودة لتتطابق مع الأنواع الجديدة
UPDATE properties SET type = 'محلات تجارية' WHERE type = 'تجاري';
UPDATE properties SET type = 'سكني تجاري' WHERE type = 'عقار سكني وتجاري';
UPDATE properties SET type = 'سكني' WHERE type = 'residential';
UPDATE properties SET type = 'محلات تجارية' WHERE type = 'commercial';
UPDATE properties SET type = 'سكني تجاري' WHERE type = 'mixed';
UPDATE properties SET type = 'عمارة' WHERE type = 'building';

-- الآن يمكن إضافة القيد الجديد
ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_type_check;
ALTER TABLE properties ADD CONSTRAINT properties_type_check 
CHECK (type IN ('سكني تجاري', 'سكني', 'عمارة', 'محلات تجارية'));

-- تعليق على الأعمدة الجديدة
COMMENT ON COLUMN properties.tax_percentage IS 'نسبة الضريبة المضافة على الإيراد';
COMMENT ON COLUMN properties.shop_count IS 'عدد المحلات التجارية';
COMMENT ON COLUMN properties.apartment_count IS 'عدد الشقق السكنية';
COMMENT ON COLUMN properties.revenue_type IS 'نوع الإيراد: شهري أو سنوي';