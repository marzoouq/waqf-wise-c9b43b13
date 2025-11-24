-- المرحلة 1: إنشاء جدول emergency_aid_requests (تحديث)

-- جدول طلبات الفزعات الطارئة
CREATE TABLE IF NOT EXISTS emergency_aid_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE NOT NULL,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  request_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('عادي', 'عاجل', 'عاجل جداً')),
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'معلق' CHECK (status IN ('معلق', 'قيد المراجعة', 'معتمد', 'مرفوض')),
  sla_due_at TIMESTAMP,
  approved_amount NUMERIC(12,2),
  approved_by UUID,
  approved_by_name TEXT,
  approval_date TIMESTAMP,
  approval_notes TEXT,
  rejection_reason TEXT,
  payment_id UUID REFERENCES payments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- فهارس للأداء (مع IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_emergency_aid_beneficiary ON emergency_aid_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_emergency_aid_status ON emergency_aid_requests(status);
CREATE INDEX IF NOT EXISTS idx_emergency_aid_sla ON emergency_aid_requests(sla_due_at) WHERE status = 'معلق';

-- Function لتوليد رقم الطلب التلقائي
CREATE OR REPLACE FUNCTION generate_emergency_aid_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
BEGIN
  year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM '\d+$') AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM emergency_aid_requests
  WHERE request_number LIKE 'EA-' || year_part || '-%';
  
  NEW.request_number := 'EA-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_generate_emergency_aid_number ON emergency_aid_requests;
CREATE TRIGGER trigger_generate_emergency_aid_number
BEFORE INSERT ON emergency_aid_requests
FOR EACH ROW
WHEN (NEW.request_number IS NULL OR NEW.request_number = '')
EXECUTE FUNCTION generate_emergency_aid_number();

-- Function لحساب SLA تلقائياً
CREATE OR REPLACE FUNCTION calculate_emergency_sla()
RETURNS TRIGGER AS $$
BEGIN
  NEW.sla_due_at := CASE NEW.urgency_level
    WHEN 'عاجل جداً' THEN NOW() + INTERVAL '4 hours'
    WHEN 'عاجل' THEN NOW() + INTERVAL '24 hours'
    ELSE NOW() + INTERVAL '72 hours'
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_emergency_sla ON emergency_aid_requests;
CREATE TRIGGER trigger_calculate_emergency_sla
BEFORE INSERT ON emergency_aid_requests
FOR EACH ROW
EXECUTE FUNCTION calculate_emergency_sla();

-- Trigger لإرسال إشعارات
CREATE OR REPLACE FUNCTION notify_emergency_aid_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'معتمد' AND OLD.status != 'معتمد' THEN
    INSERT INTO notifications (title, message, user_id, action_url, type, priority)
    SELECT
      'تم اعتماد طلب الفزعة',
      'تم اعتماد طلب الفزعة رقم ' || NEW.request_number || ' بمبلغ ' || NEW.approved_amount || ' ريال',
      b.user_id,
      '/beneficiary-dashboard',
      'approval',
      'high'
    FROM beneficiaries b
    WHERE b.id = NEW.beneficiary_id AND b.user_id IS NOT NULL;
  END IF;
  
  IF NEW.status = 'مرفوض' AND OLD.status != 'مرفوض' THEN
    INSERT INTO notifications (title, message, user_id, action_url, type, priority)
    SELECT
      'تم رفض طلب الفزعة',
      'تم رفض طلب الفزعة رقم ' || NEW.request_number,
      b.user_id,
      '/beneficiary-dashboard',
      'rejection',
      'medium'
    FROM beneficiaries b
    WHERE b.id = NEW.beneficiary_id AND b.user_id IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_emergency_aid_status ON emergency_aid_requests;
CREATE TRIGGER trigger_notify_emergency_aid_status
AFTER UPDATE ON emergency_aid_requests
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION notify_emergency_aid_status_change();

-- ربط payment_vouchers بالمدفوعات
ALTER TABLE payment_vouchers
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES payments(id);

CREATE INDEX IF NOT EXISTS idx_payment_vouchers_payment ON payment_vouchers(payment_id);

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_emergency_aid_updated_at ON emergency_aid_requests;
CREATE TRIGGER trigger_emergency_aid_updated_at
BEFORE UPDATE ON emergency_aid_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();