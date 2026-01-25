
-- إصلاح دالة create_invoice_from_rental_payment
DROP FUNCTION IF EXISTS public.create_invoice_from_rental_payment() CASCADE;

CREATE OR REPLACE FUNCTION public.create_invoice_from_rental_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_role text;
  v_invoice_number text;
  v_tenant_id uuid;
BEGIN
  -- الحصول على tenant_id من العقد
  SELECT c.tenant_id INTO v_tenant_id
  FROM contracts c
  WHERE c.id = NEW.contract_id;

  -- فحص للمبالغ الكبيرة
  IF NEW.amount_due > 10000 AND auth.uid() IS NOT NULL THEN
    SELECT ur.role::text INTO v_user_role
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('nazer', 'admin', 'accountant', 'cashier')
    LIMIT 1;
    
    IF v_user_role IS NULL THEN
      RAISE EXCEPTION 'إنشاء فاتورة من الدفعة للمبالغ الكبيرة يتطلب صلاحية مالية';
    END IF;
  END IF;

  v_invoice_number := 'INV-' || to_char(now(), 'YYYYMMDD') || '-' || 
                     LPAD((COALESCE((SELECT COUNT(*) FROM invoices WHERE DATE(created_at) = CURRENT_DATE), 0) + 1)::text, 4, '0');

  INSERT INTO invoices (
    invoice_number, invoice_date, amount, status, contract_id, tenant_id
  )
  VALUES (
    v_invoice_number,
    CURRENT_DATE,
    NEW.amount_due,
    'pending',
    NEW.contract_id,
    v_tenant_id
  );

  RETURN NEW;
END;
$$;

-- إعادة إنشاء الـ trigger إذا كان موجوداً
DROP TRIGGER IF EXISTS create_invoice_on_rental_payment ON rental_payments;
