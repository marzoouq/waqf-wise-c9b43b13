-- إصلاح التحذيرات الأمنية - إضافة search_path لجميع الدوال

-- 1. تحديث دالة update_payment_status
CREATE OR REPLACE FUNCTION public.update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا تأخرت الدفعة
  IF NEW.due_date < CURRENT_DATE AND NEW.status = 'معلق' THEN
    NEW.status := 'متأخر';
    -- احتساب غرامة تأخير (1% من المبلغ المستحق عن كل يوم)
    NEW.late_fee := (CURRENT_DATE - NEW.due_date) * (NEW.amount_due * 0.01);
  END IF;
  
  -- إذا تم الدفع كاملاً
  IF NEW.amount_paid >= NEW.amount_due AND NEW.status != 'مدفوع' THEN
    NEW.status := 'مدفوع';
    NEW.payment_date := CURRENT_DATE;
  -- إذا تم دفع جزء
  ELSIF NEW.amount_paid > 0 AND NEW.amount_paid < NEW.amount_due THEN
    NEW.status := 'مدفوع جزئياً';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. تحديث دالة update_contract_status
CREATE OR REPLACE FUNCTION public.update_contract_status()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا انتهى العقد
  IF NEW.end_date < CURRENT_DATE AND NEW.status = 'نشط' THEN
    NEW.status := 'منتهي';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. تحديث دالة update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;