-- إنشاء جدول المدفوعات (سندات القبض والصرف)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('receipt', 'payment')),
  payment_number TEXT NOT NULL UNIQUE,
  payment_date DATE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'card')),
  payer_name TEXT NOT NULL,
  reference_number TEXT,
  description TEXT NOT NULL,
  notes TEXT,
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- سياسات RLS
CREATE POLICY "Allow authenticated read on payments"
ON public.payments
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert on payments"
ON public.payments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on payments"
ON public.payments
FOR UPDATE
USING (true);

CREATE POLICY "Allow authenticated delete on payments"
ON public.payments
FOR DELETE
USING (true);

-- إضافة trigger للـ updated_at
CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إضافة indexes
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_payment_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_payments_payment_number ON payments(payment_number);
