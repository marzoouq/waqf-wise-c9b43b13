-- ===================================================== 
-- المرحلة الخامسة: إكمال بوابة المستفيدين ونظام الطلبات
-- =====================================================

-- 1️⃣ إضافة الحقول الناقصة لجدول internal_messages
ALTER TABLE public.internal_messages 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'عادي' CHECK (priority IN ('عاجل', 'مهم', 'عادي'));

-- 2️⃣ إضافة الحقول الناقصة لجدول request_attachments
ALTER TABLE public.request_attachments 
ADD COLUMN IF NOT EXISTS uploaded_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3️⃣ تحديث جدول request_types بإضافة حقول جديدة
ALTER TABLE public.request_types 
ADD COLUMN IF NOT EXISTS requires_amount BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS requires_attachments BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'عام';

-- 4️⃣ تحديث أنواع الطلبات الموجودة بالحقول الجديدة
UPDATE public.request_types SET 
  requires_amount = true,
  requires_attachments = true,
  category = 'مالي'
WHERE name IN ('فزعة طارئة', 'قرض');

UPDATE public.request_types SET 
  requires_amount = false,
  requires_attachments = true,
  category = 'إداري'
WHERE name IN ('تحديث بيانات', 'إضافة مولود', 'استقلالية زوجة');

-- 5️⃣ إضافة حقول إضافية لجدول beneficiary_requests
ALTER TABLE public.beneficiary_requests 
ADD COLUMN IF NOT EXISTS attachments_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_message_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ;

-- 6️⃣ Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_request_attachments_uploaded_by ON public.request_attachments(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_internal_messages_priority ON public.internal_messages(priority);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_assigned_to ON public.beneficiary_requests(assigned_to);

-- 7️⃣ Function لتحديث عدد المرفقات تلقائياً
CREATE OR REPLACE FUNCTION update_request_attachments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE beneficiary_requests
    SET attachments_count = attachments_count + 1
    WHERE id = NEW.request_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE beneficiary_requests
    SET attachments_count = GREATEST(attachments_count - 1, 0)
    WHERE id = OLD.request_id;
  END IF;
  RETURN NULL;
END;
$$;

-- 8️⃣ Trigger لتحديث عدد المرفقات
DROP TRIGGER IF EXISTS trigger_update_request_attachments_count ON public.request_attachments;
CREATE TRIGGER trigger_update_request_attachments_count
AFTER INSERT OR DELETE ON public.request_attachments
FOR EACH ROW EXECUTE FUNCTION update_request_attachments_count();

-- 9️⃣ View لعرض الرسائل مع بيانات المرسل والمستقبل
CREATE OR REPLACE VIEW messages_with_users AS
SELECT 
  m.*,
  sender_b.full_name as sender_name,
  sender_b.beneficiary_number as sender_number,
  receiver_b.full_name as receiver_name,
  receiver_b.beneficiary_number as receiver_number
FROM internal_messages m
LEFT JOIN beneficiaries sender_b ON sender_b.user_id = m.sender_id
LEFT JOIN beneficiaries receiver_b ON receiver_b.user_id = m.receiver_id;