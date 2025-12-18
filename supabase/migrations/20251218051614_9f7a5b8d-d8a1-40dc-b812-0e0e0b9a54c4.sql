-- إنشاء جدول حركات الصناديق المفقود
CREATE TABLE IF NOT EXISTS public.fund_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fund_id UUID REFERENCES public.funds(id) ON DELETE CASCADE,
  transaction_type VARCHAR(50) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  description TEXT,
  reference_type VARCHAR(50),
  reference_id UUID,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fund_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "fund_transactions_staff" ON public.fund_transactions
  FOR ALL USING (is_financial_staff());

CREATE POLICY "fund_transactions_view" ON public.fund_transactions
  FOR SELECT USING (has_full_read_access());

CREATE INDEX IF NOT EXISTS idx_fund_transactions_fund ON public.fund_transactions(fund_id);

-- إنشاء دالة owns_beneficiary للتحقق من ملكية المستفيد
CREATE OR REPLACE FUNCTION public.owns_beneficiary(p_beneficiary_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.beneficiaries b
    WHERE b.id = p_beneficiary_id 
    AND b.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;