-- ==========================================
-- المرحلة 1: إصلاحات أمنية حرجة
-- ==========================================

-- 1.1 إصلاح سياسات RLS لـ governance_decisions
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة القرارات" ON governance_decisions;
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة القرارات " ON governance_decisions;

CREATE POLICY "المستخدمون المسجلون يمكنهم قراءة القرارات"
ON governance_decisions FOR SELECT TO authenticated USING (true);

-- 1.2 إضافة سياسات RLS للجداول الناقصة

-- custom_reports
CREATE POLICY "المستخدمون يمكنهم قراءة تقاريرهم"
ON custom_reports FOR SELECT TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nazer'::app_role));

CREATE POLICY "المستخدمون يمكنهم إنشاء تقارير"
ON custom_reports FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid());

CREATE POLICY "المستخدمون يمكنهم تحديث تقاريرهم"
ON custom_reports FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المستخدمون يمكنهم حذف تقاريرهم"
ON custom_reports FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- loan_payments
CREATE POLICY "المستفيدون والموظفون يمكنهم قراءة سداد القروض"
ON loan_payments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM loans l 
    INNER JOIN beneficiaries b ON l.beneficiary_id = b.id
    WHERE l.id = loan_payments.loan_id 
    AND (b.user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nazer'::app_role) OR has_role(auth.uid(), 'accountant'::app_role) OR has_role(auth.uid(), 'cashier'::app_role))
  )
);

CREATE POLICY "الموظفون المصرح لهم يمكنهم إضافة سداد القروض"
ON loan_payments FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role) OR has_role(auth.uid(), 'cashier'::app_role));

CREATE POLICY "الموظفون المصرح لهم يمكنهم تحديث سداد القروض"
ON loan_payments FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'accountant'::app_role));

-- notification_templates
CREATE POLICY "المشرفون فقط يمكنهم إدارة قوالب الإشعارات"
ON notification_templates FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- notifications
CREATE POLICY "المستخدمون يمكنهم قراءة إشعاراتهم"
ON notifications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "النظام يمكنه إنشاء إشعارات"
ON notifications FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "المستخدمون يمكنهم تحديث إشعاراتهم"
ON notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المستخدمون يمكنهم حذف إشعاراتهم"
ON notifications FOR DELETE TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- 1.3 تحويل SECURITY DEFINER Views إلى INVOKER
-- يجب التحقق من كل view وتحويله يدوياً حسب الحاجة

-- ==========================================
-- المرحلة 3: التنظيف والتحسين
-- ==========================================

-- 3.1 حذف الدوال غير المستخدمة
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_nazer();

-- 3.2 تنظيف التنبيهات القديمة
UPDATE system_alerts 
SET status = 'resolved', 
    resolved_at = NOW(),
    resolved_by = auth.uid()
WHERE status = 'active' 
  AND created_at < NOW() - INTERVAL '24 hours'
  AND severity IN ('info', 'warning');

-- توثيق الإصلاحات
COMMENT ON POLICY "المستخدمون المسجلون يمكنهم قراءة القرارات" ON governance_decisions IS 'تم إصلاح سياسة RLS - تبسيط الوصول للمستخدمين المسجلين';
COMMENT ON TABLE custom_reports IS 'تمت إضافة سياسات RLS كاملة';
COMMENT ON TABLE loan_payments IS 'تمت إضافة سياسات RLS كاملة';
COMMENT ON TABLE notification_templates IS 'تمت إضافة سياسات RLS - المشرفون فقط';
COMMENT ON TABLE notifications IS 'تمت إضافة سياسات RLS كاملة';