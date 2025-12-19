-- حذف السياسات المفتوحة القديمة المتبقية

-- approval tables
DROP POLICY IF EXISTS "authenticated_read_status" ON approval_status;
DROP POLICY IF EXISTS "authenticated_read_steps" ON approval_steps;
DROP POLICY IF EXISTS "authenticated_read_workflows" ON approval_workflows;

-- beneficiary tables
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة التصنيفات" ON beneficiary_categories;
DROP POLICY IF EXISTS "authenticated_select_beneficiary_tags" ON beneficiary_tags;

-- contract tables
DROP POLICY IF EXISTS "Authenticated users can view attachments" ON contract_attachments;
DROP POLICY IF EXISTS "authenticated_view_attachments" ON contract_attachments;
DROP POLICY IF EXISTS "Authenticated users can view renewals" ON contract_renewals;

-- dashboard tables
DROP POLICY IF EXISTS "Allow read widgets" ON dashboard_widgets;
DROP POLICY IF EXISTS "Allow read dashboards" ON dashboards;

-- document tables
DROP POLICY IF EXISTS "Users can view OCR content" ON document_ocr_content;
DROP POLICY IF EXISTS "Users can view document tags" ON document_tags;
DROP POLICY IF EXISTS "document_versions_select_policy" ON document_versions;

-- eligibility/family
DROP POLICY IF EXISTS "authenticated_select_eligibility_assessments" ON eligibility_assessments;
DROP POLICY IF EXISTS "authenticated_select_family_relationships" ON family_relationships;

-- governance tables
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة الأعضاء" ON governance_board_members;
DROP POLICY IF EXISTS "المستخدمون المسجلون يمكنهم قراءة " ON governance_decisions;

-- identity
DROP POLICY IF EXISTS "authenticated_select_identity_verifications" ON identity_verifications;

-- kpi/loans
DROP POLICY IF EXISTS "Allow read kpi_values" ON kpi_values;
DROP POLICY IF EXISTS "enable_read_installments" ON loan_installments;

-- maintenance
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة سجل الصيانة" ON maintenance_schedule_log;
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة جداول الصيانة" ON maintenance_schedules;

-- organization
DROP POLICY IF EXISTS "Allow authenticated read on organization_settings" ON organization_settings;

-- project
DROP POLICY IF EXISTS "Allow authenticated users to view documentation" ON project_documentation;

-- reports
DROP POLICY IF EXISTS "Allow read execution_log" ON report_execution_log;
DROP POLICY IF EXISTS "Allow read saved_reports" ON saved_reports;

-- requests
DROP POLICY IF EXISTS "Authenticated users can view attachments" ON request_attachments;
DROP POLICY IF EXISTS "Authenticated users can view comments" ON request_comments;

-- support
DROP POLICY IF EXISTS "الجميع يمكنهم رؤية السجل" ON support_ticket_history;

-- waqf
DROP POLICY IF EXISTS "الجميع يمكنهم قراءة النظار" ON waqf_nazers;