-- تنظيف سياسات الإشعارات المكررة
DROP POLICY IF EXISTS "notifications_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_staff_create" ON public.notifications;
DROP POLICY IF EXISTS "users_own_notifications" ON public.notifications;