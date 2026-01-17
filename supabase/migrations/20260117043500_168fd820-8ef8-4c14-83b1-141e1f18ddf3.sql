
-- إصلاح التحذير الأمني: تقييد الإدخال في audit_logs للـ triggers فقط
DROP POLICY IF EXISTS "triggers_can_insert_audit_logs" ON public.audit_logs;

-- سياسة تسمح بالإدخال فقط من خلال الـ triggers (SECURITY DEFINER functions)
-- أو من المستخدمين المصادق عليهم لتسجيل أنشطتهم
CREATE POLICY "controlled_audit_insert"
ON public.audit_logs FOR INSERT
TO authenticated
WITH CHECK (
  -- المستخدم يسجل نشاطه الخاص فقط
  user_id = auth.uid() OR user_id IS NULL
);

-- السماح للـ service_role (الذي تستخدمه الـ SECURITY DEFINER functions)
CREATE POLICY "service_role_audit_insert"
ON public.audit_logs FOR INSERT
TO service_role
WITH CHECK (true);
