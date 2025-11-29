-- ============================================
-- حذف السياسات القديمة المتساهلة
-- ============================================

-- bank_statements
DROP POLICY IF EXISTS "Allow authenticated update on bank_statements" ON bank_statements;

-- beneficiary_tags
DROP POLICY IF EXISTS "authenticated_all_beneficiary_tags" ON beneficiary_tags;

-- cash_flows
DROP POLICY IF EXISTS "Allow authenticated update on cash_flows" ON cash_flows;
DROP POLICY IF EXISTS "Admins can manage cash flows" ON cash_flows;

-- contract_units
DROP POLICY IF EXISTS "allow_delete_contract_units" ON contract_units;
DROP POLICY IF EXISTS "allow_update_contract_units" ON contract_units;

-- dashboard_widgets
DROP POLICY IF EXISTS "Allow update widgets" ON dashboard_widgets;
DROP POLICY IF EXISTS "Allow delete widgets" ON dashboard_widgets;

-- dashboards
DROP POLICY IF EXISTS "Allow update dashboards" ON dashboards;

-- document_ocr_content
DROP POLICY IF EXISTS "System can manage OCR content" ON document_ocr_content;

-- document_versions
DROP POLICY IF EXISTS "document_versions_update_policy" ON document_versions;

-- eligibility_criteria
DROP POLICY IF EXISTS "authenticated_all_eligibility_criteria" ON eligibility_criteria;

-- emergency_aid_requests
DROP POLICY IF EXISTS "enable_update_for_all" ON emergency_aid_requests;
DROP POLICY IF EXISTS "enable_delete_for_all" ON emergency_aid_requests;

-- family_relationships
DROP POLICY IF EXISTS "authenticated_all_family_relationships" ON family_relationships;

-- funds
DROP POLICY IF EXISTS "Allow authenticated update on funds" ON funds;

-- identity_verifications
DROP POLICY IF EXISTS "authenticated_all_identity_verifications" ON identity_verifications;

-- journal_entry_lines
DROP POLICY IF EXISTS "Allow authenticated update on journal_entry_lines" ON journal_entry_lines;

-- knowledge_articles
DROP POLICY IF EXISTS "knowledge_articles_write_admin" ON knowledge_articles;

-- loan_installments
DROP POLICY IF EXISTS "enable_all_installments" ON loan_installments;

-- notification_logs
DROP POLICY IF EXISTS "System can manage notification logs" ON notification_logs;

-- notification_rules
DROP POLICY IF EXISTS "enable_all_rules" ON notification_rules;

-- organization_settings
DROP POLICY IF EXISTS "Allow authenticated update on organization_settings" ON organization_settings;

-- rental_payments
DROP POLICY IF EXISTS "allow_authenticated_update_rental_payments" ON rental_payments;

-- saved_reports
DROP POLICY IF EXISTS "Allow update saved_reports" ON saved_reports;
DROP POLICY IF EXISTS "Allow delete saved_reports" ON saved_reports;

-- scheduled_reports
DROP POLICY IF EXISTS "scheduled_reports_all_policy" ON scheduled_reports;

-- tasks
DROP POLICY IF EXISTS "Allow authenticated update on tasks" ON tasks;