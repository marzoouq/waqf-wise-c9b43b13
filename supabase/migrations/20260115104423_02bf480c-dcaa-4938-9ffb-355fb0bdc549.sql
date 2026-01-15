-- ============================================
-- إصلاح الثغرات الأمنية - المرحلة الأولى والثانية
-- ============================================

-- 1. إصلاح support_messages RLS (خطورة عالية)
-- حذف السياسات المفتوحة
DROP POLICY IF EXISTS "Authenticated users can view support messages" ON public.support_messages;
DROP POLICY IF EXISTS "Staff can update support messages" ON public.support_messages;

-- إنشاء سياسات صحيحة
CREATE POLICY "users_view_own_ticket_messages"
ON public.support_messages FOR SELECT
USING (
  -- المستخدم يرى رسائل تذاكره فقط
  EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE support_tickets.id = support_messages.ticket_id 
    AND support_tickets.user_id = auth.uid()
  )
  OR 
  -- أو كان هو المرسل
  sender_id = auth.uid()
  OR
  -- أو من فريق الدعم
  public.has_staff_access()
);

CREATE POLICY "users_create_own_messages"
ON public.support_messages FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.support_tickets 
    WHERE support_tickets.id = support_messages.ticket_id 
    AND support_tickets.user_id = auth.uid()
  )
  OR public.has_staff_access()
);

CREATE POLICY "staff_update_messages"
ON public.support_messages FOR UPDATE
USING (public.has_staff_access() OR sender_id = auth.uid());

-- 2. إصلاح test_runs RLS (خطورة متوسطة)
DROP POLICY IF EXISTS "Anyone can read test runs" ON public.test_runs;

CREATE POLICY "staff_read_test_runs"
ON public.test_runs FOR SELECT
USING (public.has_staff_access());