-- المرحلة 3: جدول طلبات الفزعات الطارئة
CREATE TABLE IF NOT EXISTS emergency_aid_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE,
  beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
  amount_requested NUMERIC NOT NULL,
  amount_approved NUMERIC,
  reason TEXT NOT NULL,
  urgency_level TEXT DEFAULT 'متوسط' CHECK (urgency_level IN ('عاجل جداً', 'عاجل', 'متوسط')),
  status TEXT DEFAULT 'معلق' CHECK (status IN ('معلق', 'قيد المراجعة', 'معتمد', 'مرفوض', 'مدفوع')),
  sla_due_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_by UUID,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  payment_id UUID REFERENCES payments(id),
  annual_limit NUMERIC DEFAULT 10000,
  used_this_year NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- فهرسة للأداء
CREATE INDEX IF NOT EXISTS idx_emergency_aid_beneficiary ON emergency_aid_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_emergency_aid_status ON emergency_aid_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_aid_sla ON emergency_aid_requests(sla_due_at);

-- دالة لحساب SLA
CREATE OR REPLACE FUNCTION calculate_emergency_aid_sla()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sla_due_at := CASE 
    WHEN NEW.urgency_level = 'عاجل جداً' THEN NOW() + INTERVAL '4 hours'
    WHEN NEW.urgency_level = 'عاجل' THEN NOW() + INTERVAL '24 hours'
    ELSE NOW() + INTERVAL '72 hours'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_emergency_aid_sla
  BEFORE INSERT ON emergency_aid_requests
  FOR EACH ROW
  EXECUTE FUNCTION calculate_emergency_aid_sla();

-- دالة لتوليد رقم الطلب
CREATE OR REPLACE FUNCTION generate_emergency_aid_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.request_number IS NULL THEN
    NEW.request_number := 'ER-' || TO_CHAR(NOW(), 'YY') || '-' || 
      LPAD(NEXTVAL('emergency_aid_seq')::TEXT, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS emergency_aid_seq START 1;

CREATE TRIGGER set_emergency_aid_number
  BEFORE INSERT ON emergency_aid_requests
  FOR EACH ROW
  EXECUTE FUNCTION generate_emergency_aid_number();

-- المرحلة 4: تحسين جدول الإشعارات
ALTER TABLE notifications 
  ADD COLUMN IF NOT EXISTS channel TEXT DEFAULT 'app' CHECK (channel IN ('app', 'email', 'sms')),
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'read')),
  ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_message TEXT;

-- جدول قواعد الإشعارات
CREATE TABLE IF NOT EXISTS notification_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  days_before INTEGER DEFAULT 0,
  channels TEXT[] DEFAULT ARRAY['app']::TEXT[],
  is_active BOOLEAN DEFAULT true,
  template_subject TEXT,
  template_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إدراج قواعد افتراضية
INSERT INTO notification_rules (rule_name, trigger_event, days_before, channels, template_subject, template_body)
VALUES 
  ('تذكير استحقاق إيجار', 'payment_due', 3, ARRAY['app', 'email'], 
   'تذكير: موعد دفع الإيجار', 
   'عزيزنا، نذكركم باقتراب موعد دفع الإيجار في {{due_date}}. المبلغ المستحق: {{amount}} ريال'),
  
  ('تنبيه تأخر دفع', 'payment_overdue', 0, ARRAY['app', 'email', 'sms'],
   'تنبيه: تأخر في الدفع',
   'عزيزنا، نود تنبيهكم بوجود تأخر في دفع الإيجار. يرجى المبادرة بالسداد'),
  
  ('تذكير قسط قرض', 'loan_due', 7, ARRAY['app', 'email'],
   'تذكير: موعد قسط القرض',
   'عزيزنا، يستحق قسط القرض بتاريخ {{due_date}}. المبلغ: {{amount}} ريال'),
  
  ('موافقة فزعة', 'emergency_approved', 0, ARRAY['app', 'email', 'sms'],
   'تمت الموافقة على طلب الفزعة',
   'عزيزنا، نفيدكم بالموافقة على طلب الفزعة رقم {{request_number}}. المبلغ: {{amount}} ريال')
ON CONFLICT DO NOTHING;