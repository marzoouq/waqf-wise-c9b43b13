-- تفعيل Realtime للجداول المطلوبة
ALTER TABLE accounts REPLICA IDENTITY FULL;
ALTER TABLE fiscal_year_closings REPLICA IDENTITY FULL;

-- إضافة الجداول للنشر المباشر
ALTER PUBLICATION supabase_realtime ADD TABLE accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE fiscal_year_closings;