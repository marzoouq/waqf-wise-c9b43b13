
-- إصلاح trigger القروض
CREATE OR REPLACE FUNCTION update_loan_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- لا نفعل شيء لأن الأعمدة المطلوبة غير موجودة
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
