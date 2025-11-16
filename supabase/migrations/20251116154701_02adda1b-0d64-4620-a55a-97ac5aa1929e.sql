-- إنشاء جدول الرسائل الداخلية
CREATE TABLE IF NOT EXISTS public.internal_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  parent_message_id UUID REFERENCES public.internal_messages(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.beneficiary_requests(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.internal_messages ENABLE ROW LEVEL SECURITY;

-- سياسات RLS - المرسل والمستقبل يمكنهم القراءة
CREATE POLICY "المستخدمون يمكنهم قراءة رسائلهم"
  ON public.internal_messages
  FOR SELECT
  USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

-- يمكن إرسال رسائل
CREATE POLICY "المستخدمون يمكنهم إرسال رسائل"
  ON public.internal_messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- يمكن تحديث حالة القراءة للمستقبل فقط
CREATE POLICY "المستقبل يمكنه تحديث حالة القراءة"
  ON public.internal_messages
  FOR UPDATE
  USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Trigger لتحديث updated_at
CREATE TRIGGER internal_messages_updated_at
  BEFORE UPDATE ON public.internal_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- إنشاء فهارس
CREATE INDEX IF NOT EXISTS idx_internal_messages_sender ON public.internal_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_receiver ON public.internal_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_internal_messages_created ON public.internal_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_internal_messages_unread ON public.internal_messages(receiver_id, is_read) WHERE is_read = false;
