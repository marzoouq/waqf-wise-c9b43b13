-- ==================== إصلاح سياسات RLS للجداول الحساسة ====================

-- 1. إصلاح جدول roles
DROP POLICY IF EXISTS "everyone_can_read_roles" ON roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON roles;
DROP POLICY IF EXISTS "Allow public read access to roles" ON roles;

CREATE POLICY "Only admins can view roles"
ON roles FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'nazer'::app_role)
);

-- 2. إصلاح performance_metrics
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view performance metrics" ON performance_metrics;

CREATE POLICY "Only admins view metrics"
ON performance_metrics FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3. إصلاح budgets
DROP POLICY IF EXISTS "Allow authenticated read on budgets" ON budgets;

CREATE POLICY "Staff can view budgets"
ON budgets FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'nazer'::app_role) OR 
  public.has_role(auth.uid(), 'accountant'::app_role)
);

-- 4. إصلاح families
DROP POLICY IF EXISTS "Authenticated users can view families" ON families;

CREATE POLICY "Staff and related beneficiaries view families"
ON families FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'nazer'::app_role) OR 
  public.has_role(auth.uid(), 'accountant'::app_role) OR
  id IN (SELECT family_id FROM beneficiaries WHERE user_id = auth.uid())
);

-- 5. إصلاح cash_flows
DROP POLICY IF EXISTS "Allow authenticated read on cash_flows" ON cash_flows;

CREATE POLICY "Financial staff view cash flows"
ON cash_flows FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'nazer'::app_role) OR 
  public.has_role(auth.uid(), 'accountant'::app_role)
);

-- 6. إصلاح journal_entry_lines
DROP POLICY IF EXISTS "Allow authenticated read on journal_entry_lines" ON journal_entry_lines;

CREATE POLICY "Financial staff view journal lines"
ON journal_entry_lines FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'nazer'::app_role) OR 
  public.has_role(auth.uid(), 'accountant'::app_role)
);

-- 7. حماية جدول tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all read on tasks" ON tasks;

CREATE POLICY "Staff can view tasks"
ON tasks FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'nazer'::app_role) OR 
  public.has_role(auth.uid(), 'accountant'::app_role) OR
  public.has_role(auth.uid(), 'archivist'::app_role)
);

-- 8. حماية جدول kpi_definitions
ALTER TABLE kpi_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins view kpi definitions"
ON kpi_definitions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));