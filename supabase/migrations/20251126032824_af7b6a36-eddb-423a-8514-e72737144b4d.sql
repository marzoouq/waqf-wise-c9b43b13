-- أولاً: تعطيل RLS مؤقتاً لإضافة العمود
ALTER TABLE loans DISABLE ROW LEVEL SECURITY;

-- إضافة العمود بشكل مباشر
ALTER TABLE loans ADD COLUMN IF NOT EXISTS beneficiary_id UUID;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS paid_amount NUMERIC DEFAULT 0;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS loan_number TEXT;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS disbursement_date DATE;
ALTER TABLE loans ADD COLUMN IF NOT EXISTS principal_amount NUMERIC;

-- تحديث البيانات الموجودة
UPDATE loans 
SET beneficiary_id = (SELECT id FROM beneficiaries LIMIT 1)
WHERE beneficiary_id IS NULL AND EXISTS (SELECT 1 FROM beneficiaries LIMIT 1);

-- إضافة foreign key constraint بعد تحديث البيانات
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'loans_beneficiary_id_fkey' 
    AND table_name = 'loans'
  ) THEN
    ALTER TABLE loans ADD CONSTRAINT loans_beneficiary_id_fkey 
    FOREIGN KEY (beneficiary_id) REFERENCES beneficiaries(id) ON DELETE CASCADE;
  END IF;
END $$;

-- إعادة تفعيل RLS
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- إنشاء RLS policies جديدة
DROP POLICY IF EXISTS "loans_select_policy" ON loans;
CREATE POLICY "loans_select_policy" ON loans FOR SELECT USING (
  beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer', 'accountant', 'cashier'))
);

DROP POLICY IF EXISTS "loans_insert_policy" ON loans;
CREATE POLICY "loans_insert_policy" ON loans FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer', 'accountant'))
);

DROP POLICY IF EXISTS "loans_update_policy" ON loans;
CREATE POLICY "loans_update_policy" ON loans FOR UPDATE USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'nazer', 'accountant'))
);

-- إنشاء فهرس
CREATE INDEX IF NOT EXISTS idx_loans_beneficiary_id ON loans(beneficiary_id);