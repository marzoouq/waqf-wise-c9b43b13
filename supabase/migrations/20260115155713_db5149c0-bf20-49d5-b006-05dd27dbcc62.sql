-- =====================================================
-- بوابة المستأجرين لطلبات الصيانة
-- =====================================================

-- 1. جدول رموز OTP للمستأجرين
CREATE TABLE IF NOT EXISTS public.tenant_otp_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    phone VARCHAR(20) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 2. جدول جلسات المستأجرين
CREATE TABLE IF NOT EXISTS public.tenant_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    session_token TEXT NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. إضافة أعمدة جديدة لجدول طلبات الصيانة
ALTER TABLE public.maintenance_requests 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS unit_id UUID,
ADD COLUMN IF NOT EXISTS location_in_unit TEXT,
ADD COLUMN IF NOT EXISTS images TEXT[],
ADD COLUMN IF NOT EXISTS preferred_date DATE,
ADD COLUMN IF NOT EXISTS preferred_time_slot TEXT,
ADD COLUMN IF NOT EXISTS contact_preference TEXT DEFAULT 'phone',
ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tenant_notes TEXT,
ADD COLUMN IF NOT EXISTS admin_response TEXT,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS rating_feedback TEXT,
ADD COLUMN IF NOT EXISTS submitted_via TEXT DEFAULT 'admin';

-- 4. جدول إشعارات المستأجرين
CREATE TABLE IF NOT EXISTS public.tenant_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    related_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. تفعيل RLS على الجداول الجديدة
ALTER TABLE public.tenant_otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_notifications ENABLE ROW LEVEL SECURITY;

-- 6. سياسات الأمان لجدول OTP (للوظائف فقط)
CREATE POLICY "OTP codes are managed by system" 
ON public.tenant_otp_codes 
FOR ALL 
USING (true);

-- 7. سياسات الأمان لجدول الجلسات
CREATE POLICY "Sessions are managed by system" 
ON public.tenant_sessions 
FOR ALL 
USING (true);

-- 8. سياسات الأمان للإشعارات
CREATE POLICY "Notifications are managed by system" 
ON public.tenant_notifications 
FOR ALL 
USING (true);

-- 9. فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_tenant_otp_phone ON public.tenant_otp_codes(phone);
CREATE INDEX IF NOT EXISTS idx_tenant_otp_expires ON public.tenant_otp_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_tenant_sessions_token ON public.tenant_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_tenant_sessions_tenant ON public.tenant_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_tenant ON public.maintenance_requests(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_notifications_tenant ON public.tenant_notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_notifications_unread ON public.tenant_notifications(tenant_id, is_read) WHERE NOT is_read;

-- 10. دالة لتنظيف رموز OTP المنتهية
CREATE OR REPLACE FUNCTION cleanup_expired_tenant_otps()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM tenant_otp_codes WHERE expires_at < NOW() OR is_used = TRUE;
    DELETE FROM tenant_sessions WHERE expires_at < NOW();
END;
$$;

-- 11. تفعيل Realtime للإشعارات
ALTER PUBLICATION supabase_realtime ADD TABLE public.tenant_notifications;