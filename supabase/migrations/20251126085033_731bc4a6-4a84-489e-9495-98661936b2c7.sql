-- ==================== Part 1: تحسين User Sessions ====================

-- إضافة أعمدة مفقودة لـ user_sessions
ALTER TABLE public.user_sessions
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS device_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- تحديث الجلسات القديمة
UPDATE public.user_sessions
SET 
  is_active = (ended_at IS NULL),
  created_at = COALESCE(started_at, now())
WHERE is_active IS NULL;

-- إضافة فهرسة
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_created_at ON public.user_sessions(started_at DESC);

-- ==================== Part 2: 2FA (Two-Factor Authentication) ====================

CREATE TABLE IF NOT EXISTS public.two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  backup_codes TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  enabled_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  UNIQUE(user_id)
);

ALTER TABLE public.two_factor_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own 2FA settings"
ON public.two_factor_auth FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA settings"
ON public.two_factor_auth FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA settings"
ON public.two_factor_auth FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ==================== Part 3: تحسين Audit Logs ====================

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON public.audit_logs(severity);