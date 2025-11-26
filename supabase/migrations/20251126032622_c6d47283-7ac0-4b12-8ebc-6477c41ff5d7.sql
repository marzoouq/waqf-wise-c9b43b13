-- إصلاح جدول loans وإضافة الأعمدة المفقودة
DO $$ 
BEGIN
  -- إضافة beneficiary_id إذا لم يكن موجوداً
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'beneficiary_id'
  ) THEN
    ALTER TABLE loans ADD COLUMN beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_loans_beneficiary_id ON loans(beneficiary_id);
  END IF;

  -- إضافة أعمدة أخرى مفقودة
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'paid_amount'
  ) THEN
    ALTER TABLE loans ADD COLUMN paid_amount NUMERIC DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'loan_number'
  ) THEN
    ALTER TABLE loans ADD COLUMN loan_number TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'disbursement_date'
  ) THEN
    ALTER TABLE loans ADD COLUMN disbursement_date DATE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'loans' AND column_name = 'principal_amount'
  ) THEN
    ALTER TABLE loans ADD COLUMN principal_amount NUMERIC;
  END IF;
END $$;