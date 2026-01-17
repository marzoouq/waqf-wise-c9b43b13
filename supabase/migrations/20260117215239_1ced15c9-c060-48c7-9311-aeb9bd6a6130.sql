-- =====================================================
-- إصلاح سياسات RLS المفتوحة (10 تحذيرات)
-- =====================================================

-- ============ 1. audit_logs ============
DROP POLICY IF EXISTS "service_role_audit_insert" ON audit_logs;
CREATE POLICY "staff_insert_audit_logs"
ON audit_logs
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'archivist', 'cashier')
  )
);

-- ============ 2. contract_notifications ============
DROP POLICY IF EXISTS "authenticated_insert_contract_notifications" ON contract_notifications;
DROP POLICY IF EXISTS "authenticated_update_contract_notifications" ON contract_notifications;

CREATE POLICY "staff_insert_contract_notifications"
ON contract_notifications
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

CREATE POLICY "staff_update_contract_notifications"
ON contract_notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

-- ============ 3. contract_settlements ============
DROP POLICY IF EXISTS "authenticated_insert_settlements" ON contract_settlements;
DROP POLICY IF EXISTS "authenticated_update_settlements" ON contract_settlements;

CREATE POLICY "staff_insert_contract_settlements"
ON contract_settlements
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
);

CREATE POLICY "staff_update_contract_settlements"
ON contract_settlements
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
);

-- ============ 4. contract_termination_requests ============
DROP POLICY IF EXISTS "authenticated_insert_termination_requests" ON contract_termination_requests;
DROP POLICY IF EXISTS "authenticated_update_termination_requests" ON contract_termination_requests;

CREATE POLICY "staff_insert_termination_requests"
ON contract_termination_requests
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

CREATE POLICY "staff_update_termination_requests"
ON contract_termination_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
);

-- ============ 5. rent_adjustment_requests ============
DROP POLICY IF EXISTS "authenticated_insert_rent_adjustments" ON rent_adjustment_requests;
DROP POLICY IF EXISTS "authenticated_update_rent_adjustments" ON rent_adjustment_requests;

CREATE POLICY "staff_insert_rent_adjustments"
ON rent_adjustment_requests
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

CREATE POLICY "staff_update_rent_adjustments"
ON rent_adjustment_requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant')
  )
);

-- ============ 6. unit_handovers ============
DROP POLICY IF EXISTS "authenticated_insert_unit_handovers" ON unit_handovers;
DROP POLICY IF EXISTS "authenticated_update_unit_handovers" ON unit_handovers;

CREATE POLICY "staff_insert_unit_handovers"
ON unit_handovers
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

CREATE POLICY "staff_update_unit_handovers"
ON unit_handovers
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

-- ============ 7. system_alerts ============
DROP POLICY IF EXISTS "service_insert_alerts" ON system_alerts;
CREATE POLICY "staff_insert_system_alerts"
ON system_alerts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer')
  )
);

-- ============ 8. system_error_logs ============
-- نحتفظ بـ true للسماح بتسجيل الأخطاء من أي مستخدم
DROP POLICY IF EXISTS "service_insert_errors" ON system_error_logs;
CREATE POLICY "all_authenticated_insert_error_logs"
ON system_error_logs
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============ 9. system_health_checks ============
DROP POLICY IF EXISTS "service_insert_health" ON system_health_checks;
CREATE POLICY "staff_insert_health_checks"
ON system_health_checks
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'nazer')
  )
);