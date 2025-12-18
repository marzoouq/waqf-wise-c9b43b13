-- =====================================================
-- الدفعة 1: تحديث سياسات جداول الموافقات والتدقيق
-- =====================================================

-- 1. approval_history - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view approval history" ON public.approval_history;
DROP POLICY IF EXISTS "Staff can insert approval history" ON public.approval_history;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض سجل الموافقات" ON public.approval_history;
DROP POLICY IF EXISTS "الموظفون يمكنهم إضافة سجل الموافقات" ON public.approval_history;

CREATE POLICY "staff_select_approval_history" ON public.approval_history
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_approval_history" ON public.approval_history
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_approval_history" ON public.approval_history
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "staff_delete_approval_history" ON public.approval_history
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 2. approval_status - تحديث السياسات
DROP POLICY IF EXISTS "Staff can manage approval status" ON public.approval_status;
DROP POLICY IF EXISTS "Staff can view approval status" ON public.approval_status;
DROP POLICY IF EXISTS "الموظفون يمكنهم إدارة حالة الموافقات" ON public.approval_status;

CREATE POLICY "staff_select_approval_status" ON public.approval_status
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_approval_status" ON public.approval_status
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_approval_status" ON public.approval_status
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "staff_delete_approval_status" ON public.approval_status
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 3. approval_steps - تحديث السياسات
DROP POLICY IF EXISTS "Staff can manage approval steps" ON public.approval_steps;
DROP POLICY IF EXISTS "Staff can view approval steps" ON public.approval_steps;
DROP POLICY IF EXISTS "الموظفون يمكنهم إدارة خطوات الموافقات" ON public.approval_steps;

CREATE POLICY "staff_select_approval_steps" ON public.approval_steps
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_approval_steps" ON public.approval_steps
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_approval_steps" ON public.approval_steps
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "staff_delete_approval_steps" ON public.approval_steps
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 4. approval_workflows - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view approval workflows" ON public.approval_workflows;
DROP POLICY IF EXISTS "Admin can manage approval workflows" ON public.approval_workflows;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض سير الموافقات" ON public.approval_workflows;
DROP POLICY IF EXISTS "المسؤولون يمكنهم إدارة سير الموافقات" ON public.approval_workflows;

CREATE POLICY "staff_select_approval_workflows" ON public.approval_workflows
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "admin_insert_approval_workflows" ON public.approval_workflows
FOR INSERT TO authenticated WITH CHECK (is_admin_or_nazer());

CREATE POLICY "admin_update_approval_workflows" ON public.approval_workflows
FOR UPDATE TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "admin_delete_approval_workflows" ON public.approval_workflows
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 5. audit_logs - تحديث السياسات
DROP POLICY IF EXISTS "Admin can view audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "المسؤولون يمكنهم عرض سجلات التدقيق" ON public.audit_logs;
DROP POLICY IF EXISTS "النظام يمكنه إضافة سجلات التدقيق" ON public.audit_logs;

CREATE POLICY "admin_select_audit_logs" ON public.audit_logs
FOR SELECT TO authenticated USING (is_admin_or_nazer());

CREATE POLICY "authenticated_insert_audit_logs" ON public.audit_logs
FOR INSERT TO authenticated WITH CHECK (true);

-- 6. approvals - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view approvals" ON public.approvals;
DROP POLICY IF EXISTS "Staff can manage approvals" ON public.approvals;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض الموافقات" ON public.approvals;
DROP POLICY IF EXISTS "الموظفون يمكنهم إدارة الموافقات" ON public.approvals;

CREATE POLICY "staff_select_approvals" ON public.approvals
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_approvals" ON public.approvals
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_approvals" ON public.approvals
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "staff_delete_approvals" ON public.approvals
FOR DELETE TO authenticated USING (is_admin_or_nazer());

-- 7. approval_stats - تحديث السياسات
DROP POLICY IF EXISTS "Staff can view approval stats" ON public.approval_stats;
DROP POLICY IF EXISTS "الموظفون يمكنهم عرض إحصائيات الموافقات" ON public.approval_stats;

CREATE POLICY "staff_select_approval_stats" ON public.approval_stats
FOR SELECT TO authenticated USING (has_staff_access());

CREATE POLICY "staff_insert_approval_stats" ON public.approval_stats
FOR INSERT TO authenticated WITH CHECK (has_staff_access());

CREATE POLICY "staff_update_approval_stats" ON public.approval_stats
FOR UPDATE TO authenticated USING (has_staff_access());

CREATE POLICY "staff_delete_approval_stats" ON public.approval_stats
FOR DELETE TO authenticated USING (is_admin_or_nazer());