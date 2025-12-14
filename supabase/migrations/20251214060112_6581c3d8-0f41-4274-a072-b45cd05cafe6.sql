-- إصلاح دالة get_beneficiary_statistics لتستعلم من heir_distributions
CREATE OR REPLACE FUNCTION public.get_beneficiary_statistics(p_beneficiary_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_payments', (
      SELECT COUNT(*) FROM heir_distributions WHERE beneficiary_id = p_beneficiary_id
    ),
    'total_received', COALESCE((
      SELECT SUM(share_amount) FROM heir_distributions WHERE beneficiary_id = p_beneficiary_id
    ), 0),
    'pending_amount', COALESCE(b.pending_amount, 0),
    'pending_requests', (
      SELECT COUNT(*) FROM beneficiary_requests 
      WHERE beneficiary_id = p_beneficiary_id AND status IN ('pending', 'قيد المراجعة', 'معلق', 'submitted')
    ),
    'total_requests', (
      SELECT COUNT(*) FROM beneficiary_requests 
      WHERE beneficiary_id = p_beneficiary_id
    ),
    'last_payment_date', (
      SELECT MAX(distribution_date) FROM heir_distributions WHERE beneficiary_id = p_beneficiary_id
    ),
    'verification_status', b.verification_status,
    'eligibility_status', b.eligibility_status,
    'family_members_count', (
      SELECT COUNT(*) FROM beneficiaries 
      WHERE family_id = b.family_id AND id != p_beneficiary_id AND status = 'نشط'
    )
  )
  INTO v_result
  FROM beneficiaries b
  WHERE b.id = p_beneficiary_id;
  
  RETURN COALESCE(v_result, jsonb_build_object(
    'total_payments', 0,
    'total_received', 0,
    'pending_amount', 0,
    'pending_requests', 0,
    'total_requests', 0,
    'last_payment_date', NULL,
    'verification_status', 'pending',
    'eligibility_status', 'pending',
    'family_members_count', 0
  ));
END;
$$;

-- إنشاء دالة لتحديث total_received تلقائياً
CREATE OR REPLACE FUNCTION public.update_beneficiary_total_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_beneficiary_id UUID;
BEGIN
  -- تحديد المستفيد المتأثر
  IF TG_OP = 'DELETE' THEN
    v_beneficiary_id := OLD.beneficiary_id;
  ELSE
    v_beneficiary_id := NEW.beneficiary_id;
  END IF;
  
  -- تحديث إجمالي المستلم للمستفيد
  UPDATE beneficiaries 
  SET 
    total_received = COALESCE((
      SELECT SUM(share_amount) 
      FROM heir_distributions 
      WHERE beneficiary_id = v_beneficiary_id
    ), 0),
    updated_at = NOW()
  WHERE id = v_beneficiary_id;
  
  -- إرجاع السجل المناسب
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- إسقاط الـ trigger إذا كان موجوداً
DROP TRIGGER IF EXISTS trg_update_beneficiary_total_received ON heir_distributions;

-- إنشاء الـ trigger
CREATE TRIGGER trg_update_beneficiary_total_received
AFTER INSERT OR UPDATE OR DELETE ON heir_distributions
FOR EACH ROW
EXECUTE FUNCTION update_beneficiary_total_received();

-- تحديث أولي لجميع المستفيدين بناءً على التوزيعات الحالية
UPDATE beneficiaries b
SET 
  total_received = COALESCE((
    SELECT SUM(share_amount) 
    FROM heir_distributions 
    WHERE beneficiary_id = b.id
  ), 0),
  updated_at = NOW();