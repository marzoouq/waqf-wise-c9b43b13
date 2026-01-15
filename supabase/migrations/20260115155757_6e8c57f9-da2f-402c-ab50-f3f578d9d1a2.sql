-- إصلاح سياسات RLS للجداول الجديدة
-- هذه الجداول تُدار من Edge Functions فقط، لذا نستخدم سياسات أكثر تقييداً

-- 1. حذف السياسات القديمة
DROP POLICY IF EXISTS "OTP codes are managed by system" ON public.tenant_otp_codes;
DROP POLICY IF EXISTS "Sessions are managed by system" ON public.tenant_sessions;
DROP POLICY IF EXISTS "Notifications are managed by system" ON public.tenant_notifications;

-- 2. سياسات OTP - لا يُسمح بالوصول المباشر (Edge Functions فقط)
CREATE POLICY "Deny all direct access to OTP" 
ON public.tenant_otp_codes 
FOR ALL 
USING (false);

-- 3. سياسات الجلسات - لا يُسمح بالوصول المباشر
CREATE POLICY "Deny all direct access to sessions" 
ON public.tenant_sessions 
FOR ALL 
USING (false);

-- 4. سياسات الإشعارات - لا يُسمح بالوصول المباشر
CREATE POLICY "Deny all direct access to notifications" 
ON public.tenant_notifications 
FOR ALL 
USING (false);