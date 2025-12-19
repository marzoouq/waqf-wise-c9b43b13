-- =============================================
-- المرحلة 1: حذف سياسات INSERT المفتوحة القديمة (25 سياسة)
-- =============================================

-- 1. activities
DROP POLICY IF EXISTS "النظام يمكنه إضافة الأنشطة" ON activities;

-- 2. approval_history
DROP POLICY IF EXISTS "النظام يمكنه إضافة سجل الموافقات" ON approval_history;

-- 3. bank_statements
DROP POLICY IF EXISTS "Allow authenticated insert on bank_statements" ON bank_statements;

-- 4. bank_transfer_details
DROP POLICY IF EXISTS "Authorized users can create bank transfer details" ON bank_transfer_details;

-- 5. bank_transfer_files
DROP POLICY IF EXISTS "Authorized users can create bank transfer files" ON bank_transfer_files;

-- 6. beneficiary_activity_log
DROP POLICY IF EXISTS "النظام يمكنه إضافة سجل النشاط" ON beneficiary_activity_log;

-- 7. contact_messages
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON contact_messages;

-- 8. dashboards
DROP POLICY IF EXISTS "Authenticated users can create dashboards" ON dashboards;

-- 9. dashboard_widgets
DROP POLICY IF EXISTS "Authenticated users can create widgets" ON dashboard_widgets;

-- 10. document_versions
DROP POLICY IF EXISTS "Users can create document versions" ON document_versions;

-- 11. eligibility_assessments
DROP POLICY IF EXISTS "Staff can insert" ON eligibility_assessments;

-- 12. kpi_values
DROP POLICY IF EXISTS "Staff can insert KPI values" ON kpi_values;

-- 13. notification_logs
DROP POLICY IF EXISTS "System can insert notification logs" ON notification_logs;

-- 14. notifications
DROP POLICY IF EXISTS "System can create notifications" ON notifications;

-- 15. organization_settings
DROP POLICY IF EXISTS "Admins can insert organization settings" ON organization_settings;

-- 16. payment_reminders
DROP POLICY IF EXISTS "Staff can create payment reminders" ON payment_reminders;

-- 17. report_execution_log
DROP POLICY IF EXISTS "System can log report executions" ON report_execution_log;

-- 18. request_attachments
DROP POLICY IF EXISTS "Users can upload attachments" ON request_attachments;

-- 19. request_comments
DROP POLICY IF EXISTS "Users can add comments" ON request_comments;

-- 20. request_workflows
DROP POLICY IF EXISTS "System can create workflows" ON request_workflows;

-- 21. saved_reports
DROP POLICY IF EXISTS "Users can save reports" ON saved_reports;

-- 22. sensitive_data_access_log
DROP POLICY IF EXISTS "System can log sensitive data access" ON sensitive_data_access_log;

-- 23. system_alerts
DROP POLICY IF EXISTS "System can create alerts" ON system_alerts;

-- 24. system_error_logs
DROP POLICY IF EXISTS "System can log errors" ON system_error_logs;

-- 25. user_roles_audit
DROP POLICY IF EXISTS "System can audit role changes" ON user_roles_audit;

-- =============================================
-- المرحلة 4: إضافة Trigger لمنع القيود غير المتوازنة
-- =============================================

-- إنشاء دالة التحقق من توازن القيد
CREATE OR REPLACE FUNCTION check_journal_entry_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_total_debit NUMERIC;
  v_total_credit NUMERIC;
  v_entry_status TEXT;
BEGIN
  -- جلب حالة القيد
  SELECT status INTO v_entry_status
  FROM journal_entries
  WHERE id = NEW.journal_entry_id;
  
  -- السماح بالقيود المسودة أن تكون غير متوازنة
  IF v_entry_status = 'draft' THEN
    RETURN NEW;
  END IF;
  
  -- حساب المجاميع
  SELECT 
    COALESCE(SUM(debit_amount), 0),
    COALESCE(SUM(credit_amount), 0)
  INTO v_total_debit, v_total_credit
  FROM journal_entry_lines 
  WHERE journal_entry_id = NEW.journal_entry_id;
  
  -- التحقق من التوازن (مع هامش خطأ 0.01)
  IF ABS(v_total_debit - v_total_credit) > 0.01 THEN
    RAISE EXCEPTION 'القيد المحاسبي غير متوازن! المدين: %, الدائن: %, الفرق: %', 
      v_total_debit, v_total_credit, ABS(v_total_debit - v_total_credit);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- حذف الـ trigger القديم إن وجد
DROP TRIGGER IF EXISTS ensure_balanced_journal_entry ON journal_entry_lines;

-- إنشاء الـ trigger الجديد
CREATE TRIGGER ensure_balanced_journal_entry
AFTER INSERT OR UPDATE ON journal_entry_lines
FOR EACH ROW
EXECUTE FUNCTION check_journal_entry_balance();

-- =============================================
-- المرحلة 5: جعل archive-documents bucket خاص
-- =============================================

UPDATE storage.buckets 
SET public = false 
WHERE name = 'archive-documents';