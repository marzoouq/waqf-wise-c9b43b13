
-- إصلاح دالة إنشاء القيد المحاسبي لدفعات الإيجار
CREATE OR REPLACE FUNCTION create_rental_payment_entry()
RETURNS TRIGGER AS $$
DECLARE
  v_entry_id uuid;
  v_entry_number text;
  v_contract_number text;
  v_property_name text;
BEGIN
  -- فقط عند الدفع الفعلي
  IF NEW.status != 'paid' OR NEW.amount_paid IS NULL OR NEW.amount_paid <= 0 THEN
    RETURN NEW;
  END IF;

  -- جلب بيانات العقد والعقار
  SELECT c.contract_number, p.name
  INTO v_contract_number, v_property_name
  FROM contracts c
  JOIN properties p ON p.id = c.property_id
  WHERE c.id = NEW.contract_id;

  -- إنشاء رقم القيد
  v_entry_number := 'JE-RENT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8);

  -- إنشاء القيد المحاسبي
  INSERT INTO journal_entries (
    entry_number,
    entry_date,
    description,
    reference_type,
    reference_id,
    status
  ) VALUES (
    v_entry_number,
    COALESCE(NEW.payment_date, CURRENT_DATE),
    'دفعة إيجار - عقد ' || COALESCE(v_contract_number, '') || ' - عقار ' || COALESCE(v_property_name, ''),
    'rental_payment',
    NEW.id,
    'posted'
  ) RETURNING id INTO v_entry_id;

  -- تحديث مرجع القيد
  NEW.journal_entry_id := v_entry_id;

  -- إضافة سطور القيد
  -- سطر المدين (البنك/النقدية)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    description,
    debit_amount,
    credit_amount
  ) VALUES (
    v_entry_id,
    (SELECT id FROM accounts WHERE code = '1010' LIMIT 1),
    'دفعة إيجار - ' || COALESCE(v_contract_number, ''),
    NEW.amount_paid,
    0
  );

  -- سطر الدائن (إيراد الإيجار)
  INSERT INTO journal_entry_lines (
    journal_entry_id,
    account_id,
    description,
    debit_amount,
    credit_amount
  ) VALUES (
    v_entry_id,
    (SELECT id FROM accounts WHERE code = '4001' LIMIT 1),
    'إيراد إيجار - ' || COALESCE(v_property_name, ''),
    0,
    NEW.amount_paid
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- في حالة الخطأ، نتجاهل إنشاء القيد ونستمر
  RAISE WARNING 'فشل إنشاء القيد المحاسبي: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- إعادة إنشاء الـ trigger
DROP TRIGGER IF EXISTS trigger_create_rental_payment_entry ON rental_payments;
CREATE TRIGGER trigger_create_rental_payment_entry
  BEFORE INSERT ON rental_payments
  FOR EACH ROW
  WHEN (NEW.status = 'paid' AND NEW.amount_paid > 0)
  EXECUTE FUNCTION create_rental_payment_entry();
