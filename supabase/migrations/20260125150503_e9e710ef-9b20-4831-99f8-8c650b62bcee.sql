-- إصلاح دالة update_tenant_ledger_on_voucher - تصحيح اسم العمود من type إلى voucher_type
CREATE OR REPLACE FUNCTION update_tenant_ledger_on_voucher()
RETURNS TRIGGER AS $$
DECLARE
    v_user_role text;
BEGIN
    -- فحص للمبالغ الكبيرة
    IF NEW.amount > 20000 AND auth.uid() IS NOT NULL THEN
      SELECT ur.role::text INTO v_user_role
      FROM user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('nazer', 'admin', 'accountant', 'cashier')
      LIMIT 1;
      
      IF v_user_role IS NULL THEN
        RAISE EXCEPTION 'تحديث دفتر المستأجر لمبالغ كبيرة يتطلب صلاحية مالية';
      END IF;
    END IF;

    IF NEW.tenant_id IS NOT NULL THEN
        -- ✅ تصحيح: استخدام voucher_type بدلاً من type
        IF NEW.voucher_type = 'receipt' THEN
            UPDATE tenants 
            SET account_balance = COALESCE(account_balance, 0) - NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.tenant_id;
        ELSIF NEW.voucher_type = 'payment' THEN
            UPDATE tenants 
            SET account_balance = COALESCE(account_balance, 0) + NEW.amount,
                updated_at = NOW()
            WHERE id = NEW.tenant_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;