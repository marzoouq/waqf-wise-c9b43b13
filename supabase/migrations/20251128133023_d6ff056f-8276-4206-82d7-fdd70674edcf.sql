-- تحديث صلاحيات دور المستفيد إلى صلاحيات الاطلاع فقط
UPDATE roles 
SET permissions = '["profile.view", "waqf.view", "properties.view", "distributions.view", "governance.view", "budgets.view", "statements.view", "family_tree.view", "bank_accounts.view", "financial_reports.view", "approvals_log.view", "disclosures.view"]'::jsonb,
updated_at = now()
WHERE role_name = 'beneficiary';

-- تحديث إعدادات الشفافية للمستفيدين - تفعيل العرض فقط
UPDATE beneficiary_visibility_settings
SET
  show_overview = true,
  show_profile = true,
  show_requests = false,
  show_distributions = true,
  show_statements = true,
  show_properties = true,
  show_documents = false,
  show_bank_accounts = true,
  show_financial_reports = true,
  show_approvals_log = true,
  show_disclosures = true,
  show_governance = true,
  show_budgets = true,
  show_family_tree = true,
  show_other_beneficiaries_names = true,
  show_total_beneficiaries_count = true,
  show_beneficiary_categories = true,
  show_beneficiaries_statistics = true,
  mask_iban = true,
  mask_phone_numbers = true,
  mask_national_ids = true,
  updated_at = now()
WHERE id = (SELECT id FROM beneficiary_visibility_settings LIMIT 1);

-- إنشاء سجل في audit_logs للتوثيق
INSERT INTO audit_logs (action_type, description, table_name, severity, created_at)
VALUES (
  'PERMISSION_UPDATE',
  'تحديث صلاحيات المستفيدين من الدرجة الأولى إلى صلاحية الاطلاع فقط على بيانات الوقف',
  'roles',
  'info',
  now()
);