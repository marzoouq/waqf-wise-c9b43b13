
-- إصلاح سياسة notification_settings لتقييدها بالمستخدم المالك فقط

-- حذف السياسة القديمة
DROP POLICY IF EXISTS "all_auth_notification_settings" ON public.notification_settings;

-- إنشاء سياسات جديدة محمية
CREATE POLICY "users_select_own_notification_settings" 
ON public.notification_settings 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "users_insert_own_notification_settings" 
ON public.notification_settings 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_notification_settings" 
ON public.notification_settings 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_delete_own_notification_settings" 
ON public.notification_settings 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- سياسة للأدمن لإدارة جميع الإعدادات
CREATE POLICY "admin_manage_notification_settings" 
ON public.notification_settings 
FOR ALL 
TO authenticated
USING (is_admin_or_nazer())
WITH CHECK (is_admin_or_nazer());
