
-- إصلاح مشكلة trigger update_family_statistics
-- هذا الـ trigger يحاول تحديث أعمدة غير موجودة في جدول families

-- حذف الـ trigger المعطوب مؤقتاً
DROP TRIGGER IF EXISTS trigger_update_family_stats ON beneficiary_requests;
DROP FUNCTION IF EXISTS update_family_statistics() CASCADE;

-- إنشاء دالة مبسطة بدون أعمدة غير موجودة
CREATE OR REPLACE FUNCTION update_beneficiary_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- trigger بسيط لتحديث updated_at فقط
CREATE TRIGGER trigger_update_beneficiary_request_timestamp
  BEFORE UPDATE ON beneficiary_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_beneficiary_request_timestamp();
