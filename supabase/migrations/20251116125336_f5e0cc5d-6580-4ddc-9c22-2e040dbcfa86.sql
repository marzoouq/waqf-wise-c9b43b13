-- إصلاح RLS للجداول الحوكمة المفقودة (مصحح)

-- 1. جدول حضور الاجتماعات
ALTER TABLE governance_meeting_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_nazer_can_view_attendance"
ON governance_meeting_attendance FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer')
  )
);

CREATE POLICY "admin_can_manage_attendance"
ON governance_meeting_attendance FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- 2. جدول مراجعات السياسات
ALTER TABLE policy_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_nazer_can_view_policy_reviews"
ON policy_reviews FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer')
  )
);

CREATE POLICY "admin_can_manage_policy_reviews"
ON policy_reviews FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- 3. جدول تقييمات المخاطر
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_nazer_can_view_risk_assessments"
ON risk_assessments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer')
  )
);

CREATE POLICY "admin_can_manage_risk_assessments"
ON risk_assessments FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- 4. جدول تفويضات التصويت
ALTER TABLE voting_delegations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_view_own_delegations"
ON voting_delegations FOR SELECT
TO authenticated
USING (
  delegator_id = auth.uid() OR delegate_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer')
  )
);

CREATE POLICY "users_can_create_delegations"
ON voting_delegations FOR INSERT
TO authenticated
WITH CHECK (delegator_id = auth.uid());

CREATE POLICY "users_can_update_own_delegations"
ON voting_delegations FOR UPDATE
TO authenticated
USING (delegator_id = auth.uid());

CREATE POLICY "users_can_delete_own_delegations"
ON voting_delegations FOR DELETE
TO authenticated
USING (delegator_id = auth.uid());