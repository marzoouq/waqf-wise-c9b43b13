-- إضافة جدول الموافقات
CREATE TABLE IF NOT EXISTS public.approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  journal_entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  approver_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read on approvals" 
ON public.approvals 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on approvals" 
ON public.approvals 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on approvals" 
ON public.approvals 
FOR UPDATE 
USING (true);

-- إضافة جدول الفواتير
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  invoice_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  tax_amount NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  due_date DATE,
  notes TEXT,
  journal_entry_id UUID REFERENCES public.journal_entries(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read on invoices" 
ON public.invoices 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on invoices" 
ON public.invoices 
FOR UPDATE 
USING (true);

-- إضافة جدول بنود الفواتير
CREATE TABLE IF NOT EXISTS public.invoice_lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  line_total NUMERIC NOT NULL DEFAULT 0,
  account_id UUID REFERENCES public.accounts(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read on invoice_lines" 
ON public.invoice_lines 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on invoice_lines" 
ON public.invoice_lines 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on invoice_lines" 
ON public.invoice_lines 
FOR UPDATE 
USING (true);

-- Create trigger for approvals updated_at
CREATE TRIGGER update_approvals_updated_at
BEFORE UPDATE ON public.approvals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for invoices updated_at
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_approvals_journal_entry_id ON public.approvals(journal_entry_id);
CREATE INDEX idx_approvals_status ON public.approvals(status);
CREATE INDEX idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoice_lines_invoice_id ON public.invoice_lines(invoice_id);