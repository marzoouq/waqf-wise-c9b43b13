-- =====================================================
-- إصلاح سياسات RLS للجداول الحساسة
-- =====================================================

-- 1. إصلاح جدول profiles - حذف السياسات المتضاربة وإنشاء سياسات واضحة
DROP POLICY IF EXISTS "Authenticated users can view contact messages" ON public.contact_messages;

-- إنشاء سياسة جديدة - فقط الموظفين يمكنهم رؤية رسائل التواصل
CREATE POLICY "staff_only_view_contact_messages" 
ON public.contact_messages 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
  )
);

-- 2. تحديث سياسة annual_disclosures - المسودات فقط للموظفين
DROP POLICY IF EXISTS "الجميع يمكنهم مشاهدة الإفصاحات ال" ON public.annual_disclosures;

CREATE POLICY "disclosures_view_policy" 
ON public.annual_disclosures 
FOR SELECT 
TO authenticated
USING (
  -- الإفصاحات المنشورة للجميع
  status = 'published'
  OR
  -- المسودات فقط للموظفين
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
);