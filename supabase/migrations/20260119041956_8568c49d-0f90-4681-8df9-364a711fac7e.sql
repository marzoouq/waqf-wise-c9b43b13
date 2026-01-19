
-- =====================================================
-- إصلاح سياسات RLS لجدول governance_board_members
-- المشكلة: سياسات متداخلة ومتساهلة تسمح لأي عضو برؤية بيانات الجميع
-- الحل: توحيد السياسات وتقييد الوصول
-- =====================================================

-- 1. حذف جميع السياسات المتداخلة الحالية
DROP POLICY IF EXISTS "admin_or_member_view_board" ON public.governance_board_members;
DROP POLICY IF EXISTS "staff_and_waqf_heirs_can_view_governance_members" ON public.governance_board_members;
DROP POLICY IF EXISTS "staff_or_heir_view_board_members" ON public.governance_board_members;
DROP POLICY IF EXISTS "المسؤولون يمكنهم إدارة الأعضاء" ON public.governance_board_members;

-- 2. إنشاء سياسة SELECT جديدة موحدة
-- المسؤولون والناظر يمكنهم رؤية جميع الأعضاء
-- الأعضاء العاديون يمكنهم رؤية سجلاتهم الخاصة فقط
CREATE POLICY "governance_board_members_select_policy" 
ON public.governance_board_members 
FOR SELECT 
TO authenticated
USING (
  -- المسؤول أو الناظر يمكنهم رؤية الجميع
  public.is_admin_or_nazer()
  OR
  -- العضو يمكنه رؤية سجله الخاص فقط
  user_id = auth.uid()
);

-- 3. سياسة INSERT - فقط المسؤولون والناظر
CREATE POLICY "governance_board_members_insert_policy"
ON public.governance_board_members
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_or_nazer());

-- 4. سياسة UPDATE - فقط المسؤولون والناظر
CREATE POLICY "governance_board_members_update_policy"
ON public.governance_board_members
FOR UPDATE
TO authenticated
USING (public.is_admin_or_nazer())
WITH CHECK (public.is_admin_or_nazer());

-- 5. سياسة DELETE - فقط المسؤولون والناظر
CREATE POLICY "governance_board_members_delete_policy"
ON public.governance_board_members
FOR DELETE
TO authenticated
USING (public.is_admin_or_nazer());
