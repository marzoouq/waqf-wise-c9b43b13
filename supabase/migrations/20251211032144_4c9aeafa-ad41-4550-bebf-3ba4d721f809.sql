-- Phase 2 Continuation: Unify RLS policies for remaining tables

-- ============================================
-- 1. CONTRACTS TABLE (13 -> 4 policies)
-- ============================================
DROP POLICY IF EXISTS "contracts_select_unified" ON contracts;
DROP POLICY IF EXISTS "contracts_insert_unified" ON contracts;
DROP POLICY IF EXISTS "contracts_update_unified" ON contracts;
DROP POLICY IF EXISTS "contracts_delete_unified" ON contracts;
DROP POLICY IF EXISTS "Contracts are viewable by staff and tenants" ON contracts;
DROP POLICY IF EXISTS "Staff can create contracts" ON contracts;
DROP POLICY IF EXISTS "Staff can update contracts" ON contracts;
DROP POLICY IF EXISTS "Staff can delete contracts" ON contracts;
DROP POLICY IF EXISTS "Heirs can view contracts" ON contracts;
DROP POLICY IF EXISTS "contracts_select" ON contracts;
DROP POLICY IF EXISTS "contracts_insert" ON contracts;
DROP POLICY IF EXISTS "contracts_update" ON contracts;
DROP POLICY IF EXISTS "contracts_delete" ON contracts;

CREATE POLICY "contracts_select_unified" ON contracts FOR SELECT
USING (is_staff_only() OR has_role(auth.uid(), 'waqf_heir') OR has_role(auth.uid(), 'beneficiary'));

CREATE POLICY "contracts_insert_unified" ON contracts FOR INSERT
WITH CHECK (is_staff_only());

CREATE POLICY "contracts_update_unified" ON contracts FOR UPDATE
USING (is_staff_only());

CREATE POLICY "contracts_delete_unified" ON contracts FOR DELETE
USING (is_staff_only());

-- ============================================
-- 2. PROPERTIES TABLE (12 -> 4 policies)
-- ============================================
DROP POLICY IF EXISTS "properties_select_unified" ON properties;
DROP POLICY IF EXISTS "properties_insert_unified" ON properties;
DROP POLICY IF EXISTS "properties_update_unified" ON properties;
DROP POLICY IF EXISTS "properties_delete_unified" ON properties;
DROP POLICY IF EXISTS "Properties are viewable by all authenticated users" ON properties;
DROP POLICY IF EXISTS "Staff can create properties" ON properties;
DROP POLICY IF EXISTS "Staff can update properties" ON properties;
DROP POLICY IF EXISTS "Staff can delete properties" ON properties;
DROP POLICY IF EXISTS "Heirs can view properties" ON properties;
DROP POLICY IF EXISTS "properties_select" ON properties;
DROP POLICY IF EXISTS "properties_insert" ON properties;
DROP POLICY IF EXISTS "properties_update" ON properties;
DROP POLICY IF EXISTS "properties_delete" ON properties;

CREATE POLICY "properties_select_unified" ON properties FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "properties_insert_unified" ON properties FOR INSERT
WITH CHECK (is_staff_only());

CREATE POLICY "properties_update_unified" ON properties FOR UPDATE
USING (is_staff_only());

CREATE POLICY "properties_delete_unified" ON properties FOR DELETE
USING (is_staff_only());

-- ============================================
-- 3. SUPPORT_TICKETS TABLE (10 -> 4 policies)
-- ============================================
DROP POLICY IF EXISTS "support_tickets_select_unified" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_insert_unified" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_update_unified" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_delete_unified" ON support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Staff can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON support_tickets;
DROP POLICY IF EXISTS "Staff can update tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_select" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_insert" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_update" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_delete" ON support_tickets;

CREATE POLICY "support_tickets_select_unified" ON support_tickets FOR SELECT
USING (is_staff_only() OR user_id = auth.uid());

CREATE POLICY "support_tickets_insert_unified" ON support_tickets FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "support_tickets_update_unified" ON support_tickets FOR UPDATE
USING (is_staff_only() OR user_id = auth.uid());

CREATE POLICY "support_tickets_delete_unified" ON support_tickets FOR DELETE
USING (is_staff_only());

-- ============================================
-- 4. PROFILES TABLE (10 -> 4 policies)
-- ============================================
DROP POLICY IF EXISTS "profiles_select_unified" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_unified" ON profiles;
DROP POLICY IF EXISTS "profiles_update_unified" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_unified" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Staff can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_delete" ON profiles;

CREATE POLICY "profiles_select_unified" ON profiles FOR SELECT
USING (is_staff_only() OR id = auth.uid());

CREATE POLICY "profiles_insert_unified" ON profiles FOR INSERT
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_unified" ON profiles FOR UPDATE
USING (is_staff_only() OR id = auth.uid());

CREATE POLICY "profiles_delete_unified" ON profiles FOR DELETE
USING (is_staff_only());