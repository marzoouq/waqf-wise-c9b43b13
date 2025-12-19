-- إصلاح سياسات RLS الأساسية

-- 1. إنشاء دوال مساعدة
CREATE OR REPLACE FUNCTION public.is_own_beneficiary(p_beneficiary_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM beneficiaries WHERE id = p_beneficiary_id AND user_id = auth.uid()) $$;

CREATE OR REPLACE FUNCTION public.is_own_activity(p_beneficiary_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$ SELECT public.is_staff() OR public.is_own_beneficiary(p_beneficiary_id) $$;

-- 2. إصلاح user_roles
DROP POLICY IF EXISTS "staff_view_roles" ON user_roles;
DROP POLICY IF EXISTS "users_read_own_role" ON user_roles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON user_roles;
CREATE POLICY "users_read_own_role_secure" ON user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- 3. إصلاح audit_logs
DROP POLICY IF EXISTS "authenticated_insert_audit_logs" ON audit_logs;
CREATE POLICY "system_insert_audit_logs_secure" ON audit_logs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND action_type IN ('login', 'logout', 'view', 'search', 'update', 'create', 'delete', 'export', 'print'));

DROP POLICY IF EXISTS "authenticated_select_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON audit_logs;
CREATE POLICY "admin_only_view_audit_logs" ON audit_logs FOR SELECT TO authenticated USING (public.is_admin());

-- 4. إصلاح beneficiary_activity_log
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة سجل النشاط" ON beneficiary_activity_log;
DROP POLICY IF EXISTS "staff_view_activity" ON beneficiary_activity_log;
CREATE POLICY "own_or_staff_view_activity_secure" ON beneficiary_activity_log FOR SELECT TO authenticated USING (public.is_own_activity(beneficiary_id));

-- 5. إصلاح identity_verifications
DROP POLICY IF EXISTS "staff_view_verifications" ON identity_verifications;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON identity_verifications;
CREATE POLICY "staff_or_own_view_verifications" ON identity_verifications FOR SELECT TO authenticated USING (public.is_staff() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()));

-- 6. إصلاح eligibility_assessments
DROP POLICY IF EXISTS "staff_view_assessments" ON eligibility_assessments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON eligibility_assessments;
CREATE POLICY "staff_or_own_view_assessments" ON eligibility_assessments FOR SELECT TO authenticated USING (public.is_staff() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()));

-- 7. إصلاح family_relationships
DROP POLICY IF EXISTS "staff_view_relationships" ON family_relationships;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON family_relationships;
CREATE POLICY "staff_or_own_view_relationships" ON family_relationships FOR SELECT TO authenticated USING (public.is_staff() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR related_to_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()));

-- 8. إصلاح organization_settings (استخدام is_heir بدلاً من is_waqf_heir)
DROP POLICY IF EXISTS "staff_view_org_settings" ON organization_settings;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON organization_settings;
CREATE POLICY "staff_or_heir_view_org_settings" ON organization_settings FOR SELECT TO authenticated USING (public.is_staff() OR public.is_heir());

-- 9. إصلاح loan_installments
DROP POLICY IF EXISTS "staff_view_installments" ON loan_installments;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON loan_installments;
CREATE POLICY "staff_or_own_view_installments" ON loan_installments FOR SELECT TO authenticated USING (public.is_staff() OR loan_id IN (SELECT l.id FROM loans l WHERE l.beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())));

-- 10. إصلاح tenants
DROP POLICY IF EXISTS "staff_view_tenants" ON tenants;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tenants;
CREATE POLICY "financial_staff_view_tenants" ON tenants FOR SELECT TO authenticated USING (public.is_admin_or_nazer() OR public.is_accountant() OR public.is_cashier());

-- 11. إصلاح beneficiary_tags
DROP POLICY IF EXISTS "staff_view_tags" ON beneficiary_tags;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON beneficiary_tags;
CREATE POLICY "staff_or_own_view_tags" ON beneficiary_tags FOR SELECT TO authenticated USING (public.is_staff() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()));