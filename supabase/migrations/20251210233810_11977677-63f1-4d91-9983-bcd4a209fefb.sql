-- إضافة حقول تفاصيل الإيرادات والضريبة
ALTER TABLE annual_disclosures ADD COLUMN IF NOT EXISTS revenue_breakdown JSONB DEFAULT NULL;
ALTER TABLE annual_disclosures ADD COLUMN IF NOT EXISTS vat_amount NUMERIC DEFAULT 0;
ALTER TABLE annual_disclosures ADD COLUMN IF NOT EXISTS monthly_data JSONB DEFAULT NULL;