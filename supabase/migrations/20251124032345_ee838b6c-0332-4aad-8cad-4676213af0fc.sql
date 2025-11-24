
-- ============================================
-- Phase 4: Beneficiary Portal System
-- نظام بوابة المستفيدين الكامل
-- ============================================

-- 1. إضافة أنواع الطلبات الستة
INSERT INTO request_types (name, name_ar, name_en, description, icon, requires_amount, requires_attachments, requires_approval, sla_hours, is_active, category)
VALUES 
  ('فزعة طارئة', 'فزعة طارئة', 'Emergency Aid', 'طلب مساعدة مالية عاجلة', 'alert-circle', true, true, true, 24, true, 'مالي'),
  ('قرض', 'قرض', 'Loan', 'طلب قرض مع جدول سداد', 'coins', true, true, true, 168, true, 'مالي'),
  ('تحديث البيانات', 'تحديث البيانات', 'Update Information', 'طلب تحديث البيانات الشخصية', 'user-cog', false, true, false, 72, true, 'إداري'),
  ('إضافة مولود', 'إضافة مولود', 'Add Newborn', 'طلب إضافة مولود جديد', 'baby', false, true, true, 72, true, 'إداري'),
  ('استقلالية', 'استقلالية', 'Independence Request', 'طلب استقلال عن الأسرة', 'home', false, true, true, 168, true, 'إداري'),
  ('طلب عام', 'طلب عام', 'General Request', 'طلب عام آخر', 'file-text', false, false, true, 168, true, 'عام')
ON CONFLICT (name) DO UPDATE SET
  name_ar = EXCLUDED.name_ar,
  name_en = EXCLUDED.name_en,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  requires_amount = EXCLUDED.requires_amount,
  requires_attachments = EXCLUDED.requires_attachments,
  requires_approval = EXCLUDED.requires_approval,
  sla_hours = EXCLUDED.sla_hours;

-- 2. إضافة حقول للمستفيدين لتتبع الحسابات
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='beneficiaries' AND column_name='account_balance') THEN
    ALTER TABLE beneficiaries ADD COLUMN account_balance DECIMAL(15,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='beneficiaries' AND column_name='total_received') THEN
    ALTER TABLE beneficiaries ADD COLUMN total_received DECIMAL(15,2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='beneficiaries' AND column_name='pending_requests') THEN
    ALTER TABLE beneficiaries ADD COLUMN pending_requests INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. View لكشف حساب المستفيد
CREATE OR REPLACE VIEW beneficiary_account_statement AS
SELECT 
  b.id as beneficiary_id,
  b.full_name,
  b.national_id,
  COALESCE(b.account_balance, 0) as account_balance,
  COALESCE(b.total_received, 0) as total_received,
  json_agg(
    json_build_object(
      'id', p.id,
      'amount', p.amount,
      'payment_date', p.payment_date,
      'description', p.description,
      'payment_method', p.payment_method,
      'reference_number', p.reference_number,
      'status', p.status
    ) ORDER BY p.payment_date DESC
  ) FILTER (WHERE p.id IS NOT NULL) as payments,
  COUNT(p.id) as total_payments
FROM beneficiaries b
LEFT JOIN payments p ON p.beneficiary_id = b.id
GROUP BY b.id, b.full_name, b.national_id, b.account_balance, b.total_received;

-- 4. Function لحساب إحصائيات المستفيد
CREATE OR REPLACE FUNCTION get_beneficiary_statistics(p_beneficiary_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats JSON;
BEGIN
  SELECT json_build_object(
    'total_received', COALESCE(SUM(p.amount), 0),
    'pending_amount', COALESCE(SUM(CASE WHEN br.status IN ('معلق', 'قيد المراجعة') THEN COALESCE(br.amount, 0) ELSE 0 END), 0),
    'approved_amount', COALESCE(SUM(CASE WHEN br.status = 'معتمد' THEN COALESCE(br.amount, 0) ELSE 0 END), 0),
    'total_requests', COUNT(DISTINCT br.id),
    'pending_requests', COUNT(DISTINCT CASE WHEN br.status IN ('معلق', 'قيد المراجعة') THEN br.id END),
    'approved_requests', COUNT(DISTINCT CASE WHEN br.status = 'معتمد' THEN br.id END),
    'rejected_requests', COUNT(DISTINCT CASE WHEN br.status = 'مرفوض' THEN br.id END),
    'last_payment_date', MAX(p.payment_date),
    'last_request_date', MAX(br.created_at)
  ) INTO v_stats
  FROM beneficiaries b
  LEFT JOIN payments p ON p.beneficiary_id = b.id AND p.status = 'مدفوع'
  LEFT JOIN beneficiary_requests br ON br.beneficiary_id = b.id
  WHERE b.id = p_beneficiary_id
  GROUP BY b.id;
  
  RETURN COALESCE(v_stats, '{"total_received": 0, "pending_amount": 0, "total_requests": 0}'::json);
END;
$$;

-- 5. Trigger لتحديث عداد الطلبات
CREATE OR REPLACE FUNCTION update_beneficiary_pending_requests()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE beneficiaries
  SET pending_requests = (
    SELECT COUNT(*)
    FROM beneficiary_requests
    WHERE beneficiary_id = COALESCE(NEW.beneficiary_id, OLD.beneficiary_id)
    AND status IN ('معلق', 'قيد المراجعة')
  )
  WHERE id = COALESCE(NEW.beneficiary_id, OLD.beneficiary_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_pending_requests ON beneficiary_requests;
CREATE TRIGGER trigger_update_pending_requests
AFTER INSERT OR UPDATE OR DELETE ON beneficiary_requests
FOR EACH ROW
EXECUTE FUNCTION update_beneficiary_pending_requests();

-- 6. Trigger لتحديث إجمالي المستلم
CREATE OR REPLACE FUNCTION update_beneficiary_total_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'مدفوع' THEN
    UPDATE beneficiaries
    SET 
      total_received = COALESCE(total_received, 0) + NEW.amount,
      account_balance = COALESCE(account_balance, 0) + NEW.amount
    WHERE id = NEW.beneficiary_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_total_received ON payments;
CREATE TRIGGER trigger_update_total_received
AFTER INSERT OR UPDATE ON payments
FOR EACH ROW
WHEN (NEW.status = 'مدفوع')
EXECUTE FUNCTION update_beneficiary_total_received();

-- 7. Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_beneficiary_status 
ON beneficiary_requests(beneficiary_id, status);

CREATE INDEX IF NOT EXISTS idx_payments_beneficiary_status 
ON payments(beneficiary_id, status);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id 
ON beneficiaries(user_id) WHERE user_id IS NOT NULL;

-- 8. منح الصلاحيات
GRANT EXECUTE ON FUNCTION get_beneficiary_statistics(UUID) TO authenticated;

-- 9. Comments
COMMENT ON VIEW beneficiary_account_statement IS 'كشف حساب شامل للمستفيدين مع تفاصيل المدفوعات';
COMMENT ON FUNCTION get_beneficiary_statistics IS 'إحصائيات شاملة للمستفيد (المستلم، المعلق، المعتمد، المرفوض)';
COMMENT ON FUNCTION update_beneficiary_pending_requests IS 'تحديث عداد الطلبات المعلقة تلقائياً';
COMMENT ON FUNCTION update_beneficiary_total_received IS 'تحديث إجمالي المبالغ المستلمة تلقائياً';
