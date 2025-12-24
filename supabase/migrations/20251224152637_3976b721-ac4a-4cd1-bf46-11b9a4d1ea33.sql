
-- إضافة فهارس مفقودة على الأعمدة المستخدمة بكثرة
-- لتحسين أداء الاستعلامات

-- فهرس على beneficiary_sessions
CREATE INDEX IF NOT EXISTS idx_beneficiary_sessions_beneficiary_id 
ON beneficiary_sessions(beneficiary_id);

CREATE INDEX IF NOT EXISTS idx_beneficiary_sessions_created_at 
ON beneficiary_sessions(created_at);

-- فهرس على audit_logs_archive
CREATE INDEX IF NOT EXISTS idx_audit_logs_archive_created_at 
ON audit_logs_archive(created_at);

CREATE INDEX IF NOT EXISTS idx_audit_logs_archive_user_id 
ON audit_logs_archive(user_id);

-- فهرس على historical_rental_details
CREATE INDEX IF NOT EXISTS idx_historical_rental_details_created_at 
ON historical_rental_details(created_at);

-- فهرس على project_documentation
CREATE INDEX IF NOT EXISTS idx_project_documentation_status 
ON project_documentation(status);

CREATE INDEX IF NOT EXISTS idx_project_documentation_created_at 
ON project_documentation(created_at);
