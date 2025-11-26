-- حذف جدول request_types القديم وإعادة إنشائه بشكل صحيح
DROP TABLE IF EXISTS request_types CASCADE;

CREATE TABLE request_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  requires_amount BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة أنواع الطلبات الافتراضية
INSERT INTO request_types (name_ar, name_en, requires_amount) VALUES
  ('فزعة طارئة', 'Emergency Aid', true),
  ('قرض', 'Loan', true),
  ('تحديث بيانات', 'Data Update', false),
  ('إضافة مولود', 'Add Newborn', false),
  ('استفسار عام', 'General Inquiry', false),
  ('شكوى', 'Complaint', false),
  ('أخرى', 'Other', false);

-- تفعيل RLS
ALTER TABLE request_types ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للجميع
CREATE POLICY "request_types_select_policy" ON request_types
  FOR SELECT
  USING (is_active = true);

-- trigger للـ updated_at
CREATE TRIGGER update_request_types_updated_at
  BEFORE UPDATE ON request_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();