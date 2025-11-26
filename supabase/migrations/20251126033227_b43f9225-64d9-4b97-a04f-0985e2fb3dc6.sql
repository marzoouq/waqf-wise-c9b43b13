-- حذف RLS policies القديمة التي تسبب مشاكل
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('loan_payments', 'notifications', 'custom_reports', 'notification_templates')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- الآن إنشاء الجداول المفقودة
CREATE TABLE IF NOT EXISTS loan_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  max_amount NUMERIC,
  min_amount NUMERIC DEFAULT 0,
  interest_rate NUMERIC DEFAULT 0,
  max_term_months INTEGER DEFAULT 12,
  grace_period_months INTEGER DEFAULT 0,
  requires_guarantor BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loan_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  due_date DATE NOT NULL,
  principal_amount NUMERIC NOT NULL,
  interest_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  paid_amount NUMERIC DEFAULT 0,
  payment_date DATE,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(loan_id, installment_number)
);

CREATE TABLE IF NOT EXISTS emergency_aid (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  request_id UUID REFERENCES beneficiary_requests(id),
  aid_type TEXT NOT NULL DEFAULT 'emergency',
  amount NUMERIC NOT NULL,
  reason TEXT NOT NULL,
  urgency_level TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  approved_date DATE,
  approved_by UUID,
  disbursed_date DATE,
  disbursed_by UUID,
  payment_voucher_id UUID REFERENCES payment_vouchers(id),
  notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE,
  beneficiary_id UUID REFERENCES beneficiaries(id) UNIQUE,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT true,
  in_app_enabled BOOLEAN DEFAULT true,
  distribution_notifications BOOLEAN DEFAULT true,
  request_notifications BOOLEAN DEFAULT true,
  payment_notifications BOOLEAN DEFAULT true,
  loan_notifications BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES custom_reports(id),
  report_name TEXT NOT NULL,
  generated_by UUID,
  generation_time_ms INTEGER,
  file_path TEXT,
  file_format TEXT,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_loan_schedules_loan_id ON loan_schedules(loan_id);
CREATE INDEX IF NOT EXISTS idx_emergency_aid_beneficiary_id ON emergency_aid(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Triggers
CREATE TRIGGER update_loan_types_updated_at BEFORE UPDATE ON loan_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loan_schedules_updated_at BEFORE UPDATE ON loan_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emergency_aid_updated_at BEFORE UPDATE ON emergency_aid FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON notification_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies بسيطة
ALTER TABLE loan_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_aid ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "all_auth_loan_types" ON loan_types FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "all_auth_loan_schedules" ON loan_schedules FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "all_auth_emergency_aid" ON emergency_aid FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "all_auth_notification_settings" ON notification_settings FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "all_auth_report_log" ON report_generation_log FOR ALL USING (auth.uid() IS NOT NULL);

-- بيانات افتراضية
INSERT INTO loan_types (name_ar, name_en, max_amount, min_amount, max_term_months) VALUES
  ('قرض حسن', 'Interest-Free Loan', 50000, 5000, 24),
  ('قرض طارئ', 'Emergency Loan', 30000, 1000, 12)
ON CONFLICT DO NOTHING;