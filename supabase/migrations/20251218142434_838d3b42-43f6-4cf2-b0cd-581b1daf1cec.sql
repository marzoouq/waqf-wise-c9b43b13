-- Phase 3: Performance Indexes - Batch 2 (Final)

-- tenants indexes
CREATE INDEX IF NOT EXISTS idx_tenants_email ON public.tenants(email);
CREATE INDEX IF NOT EXISTS idx_tenants_created ON public.tenants(created_at DESC);

-- families indexes
CREATE INDEX IF NOT EXISTS idx_families_head ON public.families(head_of_family_id);

-- support_tickets indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_beneficiary ON public.support_tickets(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON public.support_tickets(created_at DESC);

-- emergency_aid_requests indexes
CREATE INDEX IF NOT EXISTS idx_emergency_aid_status ON public.emergency_aid_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_aid_beneficiary ON public.emergency_aid_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_emergency_aid_urgency ON public.emergency_aid_requests(urgency_level);

-- beneficiary_requests indexes
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_status ON public.beneficiary_requests(status);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_beneficiary ON public.beneficiary_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_type ON public.beneficiary_requests(request_type_id);

-- documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_created ON public.documents(created_at DESC);

-- invoices indexes
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON public.invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_name);

-- property_units indexes
CREATE INDEX IF NOT EXISTS idx_property_units_property ON public.property_units(property_id);
CREATE INDEX IF NOT EXISTS idx_property_units_status ON public.property_units(occupancy_status);

-- bank_accounts indexes
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON public.bank_accounts(is_active);

-- distribution_details indexes
CREATE INDEX IF NOT EXISTS idx_distribution_details_distribution ON public.distribution_details(distribution_id);
CREATE INDEX IF NOT EXISTS idx_distribution_details_beneficiary ON public.distribution_details(beneficiary_id);