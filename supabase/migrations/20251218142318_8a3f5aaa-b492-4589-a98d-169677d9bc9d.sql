-- Phase 3: Performance Indexes - Batch 1A
-- beneficiaries indexes
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON public.beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON public.beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_category ON public.beneficiaries(category);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_family_id ON public.beneficiaries(family_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_created_at ON public.beneficiaries(created_at DESC);

-- payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_payments_reference_type_id ON public.payments(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_payments_payer_name ON public.payments(payer_name);

-- journal_entries indexes
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON public.journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entries_entry_date ON public.journal_entries(entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_fiscal_year ON public.journal_entries(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_reference ON public.journal_entries(reference_type, reference_id);

-- journal_entry_lines indexes
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON public.journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_journal ON public.journal_entry_lines(journal_entry_id);

-- contracts indexes
CREATE INDEX IF NOT EXISTS idx_contracts_status ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_property ON public.contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_contracts_tenant ON public.contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON public.contracts(start_date, end_date);