-- إصلاح سياسات governance_boards المتساهلة
-- حذف السياسة التي تسمح للجميع برؤية المجالس النشطة
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة المجالس النشط" ON public.governance_boards;

-- إصلاح سياسات request_types المتساهلة
-- حذف السياسات التي تسمح لجميع المستخدمين المصادق عليهم
DROP POLICY IF EXISTS "Authenticated users can view request types" ON public.request_types;
DROP POLICY IF EXISTS "authenticated_can_view_request_types" ON public.request_types;
DROP POLICY IF EXISTS "authenticated_view_request_types" ON public.request_types;

-- إصلاح سياسات broadcast_notifications
-- تغيير السياسة من true إلى أكثر أماناً
DROP POLICY IF EXISTS "Authenticated users can view broadcast notifications" ON public.broadcast_notifications;

-- إنشاء سياسة جديدة تسمح للمستخدمين المصادق عليهم برؤية الإشعارات
CREATE POLICY "Users can view broadcast notifications"
ON public.broadcast_notifications
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- الإشعارات العامة (للجميع)
    target_type = 'all'
    OR
    -- للموظفين رؤية الكل
    has_staff_access()
  )
);