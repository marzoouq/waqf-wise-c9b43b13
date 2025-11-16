
-- إصلاح الدوال الفعلية بإضافة search_path

-- 1. auto_assign_ticket
ALTER FUNCTION auto_assign_ticket() SET search_path = public, pg_temp;

-- 2. auto_escalate_overdue_tickets  
ALTER FUNCTION auto_escalate_overdue_tickets() SET search_path = public, pg_temp;

-- 3. check_loan_approvals
ALTER FUNCTION check_loan_approvals() SET search_path = public, pg_temp;

-- 4. check_payment_approvals
ALTER FUNCTION check_payment_approvals() SET search_path = public, pg_temp;

-- 5. update_agent_stats_on_ticket_change
ALTER FUNCTION update_agent_stats_on_ticket_change() SET search_path = public, pg_temp;

-- 6. update_updated_at
ALTER FUNCTION update_updated_at() SET search_path = public, pg_temp;

-- 7. إصلاح notification_templates RLS
CREATE POLICY "Admins can manage notification templates"
ON notification_templates FOR ALL
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) 
  OR has_role(auth.uid(), 'nazer'::app_role)
);

CREATE POLICY "Staff can view notification templates"
ON notification_templates FOR SELECT
TO authenticated
USING (
  is_active = true 
  AND (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'nazer'::app_role)
    OR has_role(auth.uid(), 'accountant'::app_role)
    OR has_role(auth.uid(), 'cashier'::app_role)
  )
);
