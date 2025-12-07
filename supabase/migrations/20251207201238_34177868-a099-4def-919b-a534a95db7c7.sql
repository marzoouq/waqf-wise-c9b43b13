-- جدول تتبع نشاط المستفيدين المباشر
CREATE TABLE IF NOT EXISTS public.beneficiary_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES public.beneficiaries(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  current_page TEXT,
  current_section TEXT,
  ip_address TEXT,
  user_agent TEXT,
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- فهرس للبحث السريع
CREATE INDEX idx_beneficiary_sessions_beneficiary ON public.beneficiary_sessions(beneficiary_id);
CREATE INDEX idx_beneficiary_sessions_online ON public.beneficiary_sessions(is_online, last_activity);

-- تفعيل RLS
ALTER TABLE public.beneficiary_sessions ENABLE ROW LEVEL SECURITY;

-- سياسة للناظر والإدارة لرؤية كل النشاط
CREATE POLICY "Staff can view all sessions"
ON public.beneficiary_sessions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  )
);

-- سياسة للمستفيدين لإدارة جلساتهم
CREATE POLICY "Beneficiaries can manage own sessions"
ON public.beneficiary_sessions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.beneficiaries b
    WHERE b.id = beneficiary_id
    AND b.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.beneficiaries b
    WHERE b.id = beneficiary_id
    AND b.user_id = auth.uid()
  )
);

-- تفعيل Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.beneficiary_sessions;

-- تحديث last_activity_at في جدول beneficiaries
CREATE OR REPLACE FUNCTION update_beneficiary_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.beneficiaries
  SET last_activity_at = NEW.last_activity
  WHERE id = NEW.beneficiary_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_beneficiary_activity
AFTER INSERT OR UPDATE ON public.beneficiary_sessions
FOR EACH ROW
EXECUTE FUNCTION update_beneficiary_last_activity();