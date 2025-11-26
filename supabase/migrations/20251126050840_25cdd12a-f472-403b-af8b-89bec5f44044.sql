-- حذف جميع البيانات التجريبية من قاعدة البيانات
-- استخدام CASCADE لحذف البيانات المرتبطة تلقائياً

-- حذف البيانات من الجداول الرئيسية (CASCADE سيحذف البيانات المرتبطة)
TRUNCATE TABLE 
  beneficiaries,
  families,
  properties,
  contracts,
  distributions,
  loans,
  documents,
  funds,
  notifications,
  activities,
  payments,
  invoices,
  journal_entries,
  bank_statements,
  payment_vouchers,
  bank_transfer_files,
  annual_disclosures,
  emergency_aid_requests,
  chatbot_conversations,
  custom_reports,
  saved_searches,
  saved_filters,
  audit_logs,
  login_attempts,
  cash_flows,
  budgets
CASCADE;

-- إعادة تعيين Sequences للبدء من الصفر
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT sequence_name 
        FROM information_schema.sequences 
        WHERE sequence_schema = 'public'
          AND sequence_name IN (
            'invoice_sequence',
            'payment_sequence', 
            'journal_entry_sequence',
            'loan_seq'
          )
    LOOP
        EXECUTE 'ALTER SEQUENCE IF EXISTS ' || r.sequence_name || ' RESTART WITH 1';
    END LOOP;
END $$;

-- ملاحظة: تم الحفاظ على الهياكل التالية:
-- ✓ الجداول والمكونات (Tables & Components)
-- ✓ user_roles (أدوار المستخدمين)
-- ✓ accounts (شجرة الحسابات)
-- ✓ fiscal_years (السنوات المالية)  
-- ✓ beneficiary_categories (تصنيفات المستفيدين)
-- ✓ request_types (أنواع الطلبات)
-- ✓ system_settings (إعدادات النظام)
-- ✓ bank_accounts (الحسابات البنكية)