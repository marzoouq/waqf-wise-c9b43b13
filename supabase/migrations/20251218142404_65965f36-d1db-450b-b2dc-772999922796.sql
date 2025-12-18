-- Phase 3: Performance Indexes - Batch 1B (Verified columns)

-- properties indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- distributions indexes
CREATE INDEX IF NOT EXISTS idx_distributions_status ON public.distributions(status);
CREATE INDEX IF NOT EXISTS idx_distributions_date ON public.distributions(distribution_date DESC);
CREATE INDEX IF NOT EXISTS idx_distributions_journal ON public.distributions(journal_entry_id);

-- loans indexes
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.loans(status);
CREATE INDEX IF NOT EXISTS idx_loans_beneficiary ON public.loans(beneficiary_id);

-- notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

-- audit_logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON public.audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);

-- user_roles indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);

-- profiles indexes  
CREATE INDEX IF NOT EXISTS idx_profiles_user ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(is_active);

-- accounts indexes
CREATE INDEX IF NOT EXISTS idx_accounts_code ON public.accounts(code);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON public.accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_accounts_parent ON public.accounts(parent_id);

-- rental_payments indexes
CREATE INDEX IF NOT EXISTS idx_rental_payments_contract ON public.rental_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_rental_payments_status ON public.rental_payments(status);
CREATE INDEX IF NOT EXISTS idx_rental_payments_date ON public.rental_payments(payment_date DESC);

-- heir_distributions indexes (correct columns)
CREATE INDEX IF NOT EXISTS idx_heir_distributions_beneficiary ON public.heir_distributions(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_heir_distributions_fiscal_year ON public.heir_distributions(fiscal_year_id);
CREATE INDEX IF NOT EXISTS idx_heir_distributions_status ON public.heir_distributions(status);

-- fiscal_years indexes (only is_active, no status)
CREATE INDEX IF NOT EXISTS idx_fiscal_years_active ON public.fiscal_years(is_active);