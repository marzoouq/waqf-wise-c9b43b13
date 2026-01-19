-- إصلاح سياسة request_approvals المتساهلة
DROP POLICY IF EXISTS "Authenticated users can view request approvals" ON public.request_approvals;

-- إضافة سياسة SELECT أكثر أماناً
CREATE POLICY "staff_select_request_approvals" ON public.request_approvals
  FOR SELECT USING (has_staff_access());