-- إضافة أعمدة تفعيل تسجيل الدخول للمستفيدين
ALTER TABLE beneficiaries
ADD COLUMN IF NOT EXISTS can_login boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS username text UNIQUE,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS login_enabled_at timestamp with time zone;

-- إضافة فهرس للبحث السريع بـ username
CREATE INDEX IF NOT EXISTS idx_beneficiaries_username ON beneficiaries(username) WHERE username IS NOT NULL;

-- إضافة فهرس للبحث بـ user_id
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id) WHERE user_id IS NOT NULL;