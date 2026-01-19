
-- ============================================
-- إصلاح جنائي - تنظيف الإشعارات المكررة فقط
-- ============================================

-- حذف جميع الإشعارات المكررة عدا الأقدم لكل مستخدم
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, DATE(created_at) 
    ORDER BY created_at ASC
  ) as rn
  FROM notifications
  WHERE title = '📊 التقرير الأسبوعي جاهز'
)
DELETE FROM notifications
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- تأمين دالة calculate_distribution_shares بدون تعارض
-- استخدام NUMERIC بدلاً من DECIMAL لتجنب التعارض
CREATE OR REPLACE FUNCTION public.secure_calculate_distribution_shares(
  p_total_amount NUMERIC,
  p_sons_count INTEGER,
  p_daughters_count INTEGER,
  p_wives_count INTEGER
)
RETURNS TABLE(son_share NUMERIC, daughter_share NUMERIC, wife_share NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_total_shares NUMERIC;
  v_son_ratio NUMERIC := 2.0;
  v_daughter_ratio NUMERIC := 1.0;
  v_wife_ratio NUMERIC := 1.0;
BEGIN
  -- ✅ فحص الصلاحيات
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  LIMIT 1;
  
  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'غير مصرح: يتطلب صلاحية ناظر أو مدير أو محاسب';
  END IF;

  v_total_shares := (p_sons_count * v_son_ratio) + 
                    (p_daughters_count * v_daughter_ratio) + 
                    (p_wives_count * v_wife_ratio);
  
  IF v_total_shares = 0 THEN
    RETURN QUERY SELECT 0::NUMERIC, 0::NUMERIC, 0::NUMERIC;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    ROUND((p_total_amount * v_son_ratio / v_total_shares), 2),
    ROUND((p_total_amount * v_daughter_ratio / v_total_shares), 2),
    ROUND((p_total_amount * v_wife_ratio / v_total_shares), 2);
END;
$$;

-- تأمين دالة secure_auto_approve_distribution
CREATE OR REPLACE FUNCTION public.secure_auto_approve_distribution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
BEGIN
  -- فحص الصلاحيات للتوزيعات الكبيرة (أكثر من 10,000)
  IF NEW.total_amount > 10000 THEN
    SELECT ur.role::text INTO v_user_role
    FROM user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('nazer', 'admin')
    LIMIT 1;
    
    IF v_user_role IS NULL AND auth.uid() IS NOT NULL THEN
      RAISE EXCEPTION 'التوزيعات أكبر من 10,000 ريال تتطلب موافقة الناظر أو المدير';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- تأمين دالة secure_check_approvals
CREATE OR REPLACE FUNCTION public.secure_check_distribution_approvals(p_distribution_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_approved boolean;
BEGIN
  -- ✅ فحص الصلاحيات
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  LIMIT 1;
  
  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'غير مصرح: يتطلب صلاحية للتحقق من الموافقات';
  END IF;

  SELECT status = 'معتمد' INTO v_approved
  FROM distributions
  WHERE id = p_distribution_id;
  
  RETURN COALESCE(v_approved, false);
END;
$$;

-- إضافة تعليقات للتوثيق
COMMENT ON FUNCTION secure_calculate_distribution_shares(NUMERIC, INTEGER, INTEGER, INTEGER) IS 'دالة حساب حصص التوزيع الشرعي - مؤمنة - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION secure_auto_approve_distribution IS 'دالة الموافقة التلقائية المؤمنة - الفحص الجنائي 2026-01-19';
COMMENT ON FUNCTION secure_check_distribution_approvals IS 'دالة فحص موافقات التوزيع المؤمنة - الفحص الجنائي 2026-01-19';
