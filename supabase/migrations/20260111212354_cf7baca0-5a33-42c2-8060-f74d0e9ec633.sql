
-- 1. تحديث سياسات waqf_units لتشمل الناظر
DROP POLICY IF EXISTS "Admins can delete waqf units" ON waqf_units;
DROP POLICY IF EXISTS "Admins can insert waqf units" ON waqf_units;
DROP POLICY IF EXISTS "Admins can update waqf units" ON waqf_units;

CREATE POLICY "admin_nazer_can_delete_waqf_units" ON waqf_units
  FOR DELETE USING (is_admin_or_nazer());

CREATE POLICY "admin_nazer_can_insert_waqf_units" ON waqf_units
  FOR INSERT WITH CHECK (is_admin_or_nazer());

CREATE POLICY "admin_nazer_can_update_waqf_units" ON waqf_units
  FOR UPDATE USING (is_admin_or_nazer());

-- 2. تحديث سياسات tenant_ledger لتشمل الحذف للمدير والناظر
DROP POLICY IF EXISTS "financial_tenant_ledger" ON tenant_ledger;

CREATE POLICY "admin_nazer_manage_tenant_ledger" ON tenant_ledger
  FOR ALL USING (is_admin_or_nazer());

CREATE POLICY "financial_staff_manage_tenant_ledger" ON tenant_ledger
  FOR ALL USING (is_financial_staff());

-- 3. إضافة ON DELETE CASCADE لـ tenant_ledger عند حذف العقد
ALTER TABLE tenant_ledger 
  DROP CONSTRAINT IF EXISTS tenant_ledger_contract_id_fkey;

ALTER TABLE tenant_ledger
  ADD CONSTRAINT tenant_ledger_contract_id_fkey 
  FOREIGN KEY (contract_id) 
  REFERENCES contracts(id) 
  ON DELETE CASCADE;

-- 4. تحديث سياسات contracts لضمان صلاحيات كاملة للمدير والناظر
DROP POLICY IF EXISTS "contracts_staff_manage" ON contracts;
DROP POLICY IF EXISTS "staff_manage_contracts" ON contracts;

CREATE POLICY "admin_nazer_full_access_contracts" ON contracts
  FOR ALL USING (is_admin_or_nazer());

-- 5. تحديث سياسات distributions لضمان صلاحيات كاملة للمدير والناظر
CREATE POLICY "admin_nazer_full_access_distributions" ON distributions
  FOR ALL USING (is_admin_or_nazer());
