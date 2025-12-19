-- حذف الفهارس المكررة (53 فهرس)
-- ================================================

-- accounts (2 فهرس)
DROP INDEX IF EXISTS idx_accounts_code;
DROP INDEX IF EXISTS idx_accounts_parent_id;

-- annual_disclosures (1 فهرس)
DROP INDEX IF EXISTS idx_annual_disclosures_year;

-- audit_logs (2 فهرس)
DROP INDEX IF EXISTS idx_audit_logs_created_at;
DROP INDEX IF EXISTS idx_audit_user;

-- auto_journal_templates (1 فهرس)
DROP INDEX IF EXISTS idx_auto_journal_templates_event;

-- bank_transactions (2 فهرس)
DROP INDEX IF EXISTS idx_bt_date;
DROP INDEX IF EXISTS idx_bt_statement;

-- beneficiaries (3 فهارس)
DROP INDEX IF EXISTS idx_beneficiaries_national_id;
DROP INDEX IF EXISTS idx_beneficiaries_user_id_category;
DROP INDEX IF EXISTS idx_beneficiaries_category_status;

-- beneficiary_attachments (1 فهرس)
DROP INDEX IF EXISTS idx_beneficiary_attachments_beneficiary_id;

-- beneficiary_requests (4 فهارس)
DROP INDEX IF EXISTS idx_beneficiary_requests_beneficiary_id;
DROP INDEX IF EXISTS idx_beneficiary_requests_status;
DROP INDEX IF EXISTS idx_br_benef;
DROP INDEX IF EXISTS idx_br_status;

-- contracts (3 فهارس)
DROP INDEX IF EXISTS idx_contracts_property_id;
DROP INDEX IF EXISTS idx_contracts_property;
DROP INDEX IF EXISTS idx_contracts_status;

-- distribution_details (2 فهرس)
DROP INDEX IF EXISTS idx_dd_benef;
DROP INDEX IF EXISTS idx_dd_dist;

-- distributions (2 فهرس)
DROP INDEX IF EXISTS idx_distributions_fiscal_year;
DROP INDEX IF EXISTS idx_distributions_status;

-- documents (2 فهرس)
DROP INDEX IF EXISTS idx_documents_entity;
DROP INDEX IF EXISTS idx_documents_category;

-- families (1 فهرس)
DROP INDEX IF EXISTS idx_families_head;

-- fiscal_years (1 فهرس)
DROP INDEX IF EXISTS idx_fiscal_years_status;

-- invoices (3 فهارس)
DROP INDEX IF EXISTS idx_invoices_property;
DROP INDEX IF EXISTS idx_invoices_tenant;
DROP INDEX IF EXISTS idx_invoices_status;

-- journal_entries (2 فهرس)
DROP INDEX IF EXISTS idx_je_date;
DROP INDEX IF EXISTS idx_je_status;

-- journal_entry_lines (2 فهرس)
DROP INDEX IF EXISTS idx_jel_account;
DROP INDEX IF EXISTS idx_jel_entry;

-- loans (2 فهرس)
DROP INDEX IF EXISTS idx_loans_beneficiary;
DROP INDEX IF EXISTS idx_loans_status;

-- maintenance_requests (2 فهرس)
DROP INDEX IF EXISTS idx_mr_property;
DROP INDEX IF EXISTS idx_mr_status;

-- notifications (2 فهرس)
DROP INDEX IF EXISTS idx_notifications_user;
DROP INDEX IF EXISTS idx_notifications_read;

-- payment_vouchers (2 فهرس)
DROP INDEX IF EXISTS idx_pv_distribution;
DROP INDEX IF EXISTS idx_pv_status;

-- properties (2 فهرس)
DROP INDEX IF EXISTS idx_properties_status;
DROP INDEX IF EXISTS idx_properties_type;

-- rental_payments (2 فهرس)
DROP INDEX IF EXISTS idx_rp_contract;
DROP INDEX IF EXISTS idx_rp_status;

-- tenants (2 فهرس)
DROP INDEX IF EXISTS idx_tenants_national_id;
DROP INDEX IF EXISTS idx_tenants_status;

-- user_roles (2 فهرس)
DROP INDEX IF EXISTS idx_user_roles_user;
DROP INDEX IF EXISTS idx_user_roles_role;