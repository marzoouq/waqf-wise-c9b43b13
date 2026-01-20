
-- إضافة أعمدة soft-delete للجداول الناقصة
-- 1. system_error_logs
ALTER TABLE public.system_error_logs 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_system_error_logs_active 
ON public.system_error_logs (created_at DESC) 
WHERE deleted_at IS NULL;

-- 2. notifications
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_notifications_active 
ON public.notifications (user_id, created_at DESC) 
WHERE deleted_at IS NULL;

-- 3. system_alerts
ALTER TABLE public.system_alerts 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_system_alerts_active 
ON public.system_alerts (created_at DESC) 
WHERE deleted_at IS NULL;

-- 4. activities
ALTER TABLE public.activities 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deleted_by UUID DEFAULT NULL,
ADD COLUMN IF NOT EXISTS deletion_reason TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_activities_active 
ON public.activities (timestamp DESC) 
WHERE deleted_at IS NULL;

-- تعليقات توضيحية
COMMENT ON COLUMN public.system_error_logs.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN public.notifications.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN public.system_alerts.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN public.activities.deleted_at IS 'Soft delete timestamp';
