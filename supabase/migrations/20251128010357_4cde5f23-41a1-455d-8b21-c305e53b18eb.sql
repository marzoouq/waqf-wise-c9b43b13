-- جدول بيانات اعتماد WebAuthn
CREATE TABLE public.webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  device_name TEXT,
  device_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, credential_id)
);

-- Enable RLS
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- المستخدم يمكنه رؤية بياناته فقط
CREATE POLICY "Users can view own credentials"
ON public.webauthn_credentials
FOR SELECT
USING (auth.uid() = user_id);

-- المستخدم يمكنه إضافة بياناته
CREATE POLICY "Users can insert own credentials"
ON public.webauthn_credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- المستخدم يمكنه تحديث بياناته
CREATE POLICY "Users can update own credentials"
ON public.webauthn_credentials
FOR UPDATE
USING (auth.uid() = user_id);

-- المستخدم يمكنه حذف بياناته
CREATE POLICY "Users can delete own credentials"
ON public.webauthn_credentials
FOR DELETE
USING (auth.uid() = user_id);

-- فهرس للبحث السريع
CREATE INDEX idx_webauthn_credential_id ON public.webauthn_credentials(credential_id);
CREATE INDEX idx_webauthn_user_id ON public.webauthn_credentials(user_id);