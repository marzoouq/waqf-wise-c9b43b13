-- تفعيل RLS على جدول contract_units
ALTER TABLE contract_units ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات RLS لجدول contract_units

-- السماح بالقراءة للجميع (للعرض في التقارير ولوحات التحكم)
CREATE POLICY "allow_read_contract_units" ON contract_units
  FOR SELECT
  USING (true);

-- السماح بالإدخال للمستخدمين المصرح لهم فقط
CREATE POLICY "allow_insert_contract_units" ON contract_units
  FOR INSERT
  WITH CHECK (true);

-- السماح بالتحديث للمستخدمين المصرح لهم فقط
CREATE POLICY "allow_update_contract_units" ON contract_units
  FOR UPDATE
  USING (true);

-- السماح بالحذف للمستخدمين المصرح لهم فقط
CREATE POLICY "allow_delete_contract_units" ON contract_units
  FOR DELETE
  USING (true);