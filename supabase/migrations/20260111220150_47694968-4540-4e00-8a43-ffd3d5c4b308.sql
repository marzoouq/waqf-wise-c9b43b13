-- Create table for storing account balances per fiscal year
CREATE TABLE IF NOT EXISTS public.account_year_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  fiscal_year_id UUID NOT NULL REFERENCES public.fiscal_years(id) ON DELETE CASCADE,
  opening_balance DECIMAL(15,2) DEFAULT 0,
  closing_balance DECIMAL(15,2) DEFAULT 0,
  total_debits DECIMAL(15,2) DEFAULT 0,
  total_credits DECIMAL(15,2) DEFAULT 0,
  is_final BOOLEAN DEFAULT false,
  closed_at TIMESTAMPTZ,
  closed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(account_id, fiscal_year_id)
);

-- Add comments
COMMENT ON TABLE public.account_year_balances IS 'أرصدة الحسابات لكل سنة مالية';
COMMENT ON COLUMN public.account_year_balances.opening_balance IS 'الرصيد الافتتاحي';
COMMENT ON COLUMN public.account_year_balances.closing_balance IS 'الرصيد الختامي';
COMMENT ON COLUMN public.account_year_balances.is_final IS 'هل تم إقفال السنة نهائياً';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_account_year_balances_account ON public.account_year_balances(account_id);
CREATE INDEX IF NOT EXISTS idx_account_year_balances_fiscal_year ON public.account_year_balances(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_account_year_balances_is_final ON public.account_year_balances(is_final);

-- Enable RLS
ALTER TABLE public.account_year_balances ENABLE ROW LEVEL SECURITY;

-- RLS Policies using user_roles table
CREATE POLICY "Allow authenticated users to read account year balances"
ON public.account_year_balances
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow nazer and admin to insert account year balances"
ON public.account_year_balances
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('nazer', 'admin')
  )
);

CREATE POLICY "Allow nazer and admin to update account year balances"
ON public.account_year_balances
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('nazer', 'admin')
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_account_year_balances_updated_at
  BEFORE UPDATE ON public.account_year_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add fiscal_year_id to journal_entries if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'journal_entries' 
    AND column_name = 'fiscal_year_id'
  ) THEN
    ALTER TABLE public.journal_entries 
    ADD COLUMN fiscal_year_id UUID REFERENCES public.fiscal_years(id);
    
    CREATE INDEX idx_journal_entries_fiscal_year ON public.journal_entries(fiscal_year_id);
  END IF;
END $$;

-- Update existing journal entries to link with active fiscal year
UPDATE public.journal_entries 
SET fiscal_year_id = (
  SELECT id FROM public.fiscal_years 
  WHERE is_active = true 
  LIMIT 1
)
WHERE fiscal_year_id IS NULL;