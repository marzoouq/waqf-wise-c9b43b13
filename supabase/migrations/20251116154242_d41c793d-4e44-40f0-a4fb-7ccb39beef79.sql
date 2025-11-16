-- إنشاء جدول القبائل
CREATE TABLE IF NOT EXISTS public.tribes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  total_families INTEGER DEFAULT 0,
  total_beneficiaries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.tribes ENABLE ROW LEVEL SECURITY;

-- سياسات RLS - يمكن للجميع القراءة
CREATE POLICY "القبائل متاحة للجميع للقراءة"
  ON public.tribes
  FOR SELECT
  USING (true);

-- يمكن للإداريين فقط الإضافة والتعديل والحذف
CREATE POLICY "الإداريون يمكنهم إدارة القبائل"
  ON public.tribes
  FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM user_roles 
      WHERE role IN ('admin', 'nazer')
    )
  );

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_tribes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tribes_updated_at
  BEFORE UPDATE ON public.tribes
  FOR EACH ROW
  EXECUTE FUNCTION update_tribes_updated_at();

-- إضافة فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_tribes_name ON public.tribes(name);
