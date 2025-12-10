-- =====================================================
-- إصلاح سياسات RLS للجداول الإضافية
-- هذه الجداول عامة بحكم التصميم (معلومات عامة للتطبيق)
-- =====================================================

-- 1. kb_articles - مقالات المعرفة العامة (يمكن للعامة رؤية المنشور فقط)
-- هذا سلوك مقصود - المقالات المنشورة للعامة

-- 2. kb_faqs - الأسئلة الشائعة العامة
-- هذا سلوك مقصود - الأسئلة الشائعة للعامة

-- 3. knowledge_articles - مقالات المعرفة
-- هذا سلوك مقصود - المنشور للعامة

-- 4. landing_page_settings - إعدادات الصفحة الرئيسية
-- هذا سلوك مقصود - الإعدادات العامة للصفحة

-- 5. إصلاح support_notification_templates - قوالب الإشعارات (للموظفين فقط)
DROP POLICY IF EXISTS "Anyone can view active templates" ON public.support_notification_templates;

CREATE POLICY "staff_view_notification_templates" 
ON public.support_notification_templates 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
);

-- 6. إصلاح report_templates - قوالب التقارير (للموظفين فقط)
DROP POLICY IF EXISTS "Anyone can view active templates" ON public.report_templates;
DROP POLICY IF EXISTS "public_view_active_report_templates" ON public.report_templates;

CREATE POLICY "staff_view_report_templates" 
ON public.report_templates 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist')
  )
);

-- 7. إصلاح kpi_definitions - تعريفات المؤشرات (للموظفين فقط)
DROP POLICY IF EXISTS "Anyone can view KPI definitions" ON public.kpi_definitions;
DROP POLICY IF EXISTS "public_view_kpi_definitions" ON public.kpi_definitions;

CREATE POLICY "staff_view_kpi_definitions" 
ON public.kpi_definitions 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_roles.user_id = auth.uid() 
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
);

-- 8. إصلاح request_types - أنواع الطلبات (للمستخدمين المصادق عليهم)
-- هذا مقبول - المستفيدين يحتاجون رؤية أنواع الطلبات لتقديم طلباتهم