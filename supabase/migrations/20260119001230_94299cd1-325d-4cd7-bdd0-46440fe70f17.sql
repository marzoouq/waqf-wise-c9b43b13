-- إضافة فحص الصلاحيات لدالة calculate_shariah_distribution
CREATE OR REPLACE FUNCTION public.calculate_shariah_distribution(p_total_amount numeric)
RETURNS TABLE(beneficiary_id uuid, heir_type text, share_amount numeric, share_percentage numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_wives_count INTEGER;
  v_sons_count INTEGER;
  v_daughters_count INTEGER;
  v_wives_share NUMERIC;
  v_remaining NUMERIC;
  v_son_share NUMERIC;
  v_daughter_share NUMERIC;
  v_total_parts NUMERIC;
BEGIN
  -- فحص الصلاحيات: فقط nazer أو admin أو accountant
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  LIMIT 1;
  
  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'غير مصرح: يتطلب صلاحية ناظر أو مدير أو محاسب';
  END IF;

  -- حساب أعداد الورثة
  SELECT COUNT(*) FILTER (WHERE relationship = 'زوجة')::INTEGER INTO v_wives_count FROM beneficiaries WHERE status = 'نشط';
  SELECT COUNT(*) FILTER (WHERE relationship = 'ابن')::INTEGER INTO v_sons_count FROM beneficiaries WHERE status = 'نشط';
  SELECT COUNT(*) FILTER (WHERE relationship = 'بنت')::INTEGER INTO v_daughters_count FROM beneficiaries WHERE status = 'نشط';
  
  -- حساب حصة الزوجات (الثمن)
  v_wives_share := p_total_amount * 0.125; -- 1/8
  v_remaining := p_total_amount - v_wives_share;
  
  -- حساب الأجزاء (للذكر مثل حظ الأنثيين)
  v_total_parts := (v_sons_count * 2) + v_daughters_count;
  
  IF v_total_parts > 0 THEN
    v_son_share := (v_remaining / v_total_parts) * 2;
    v_daughter_share := v_remaining / v_total_parts;
  ELSE
    v_son_share := 0;
    v_daughter_share := 0;
  END IF;
  
  -- إرجاع حصص الورثة
  RETURN QUERY
  SELECT 
    b.id,
    b.relationship,
    CASE 
      WHEN b.relationship = 'زوجة' THEN ROUND(v_wives_share / NULLIF(v_wives_count, 0), 2)
      WHEN b.relationship = 'ابن' THEN ROUND(v_son_share, 2)
      WHEN b.relationship = 'بنت' THEN ROUND(v_daughter_share, 2)
      ELSE 0
    END,
    CASE 
      WHEN b.relationship = 'زوجة' THEN ROUND((v_wives_share / NULLIF(v_wives_count, 0)) / p_total_amount * 100, 2)
      WHEN b.relationship = 'ابن' THEN ROUND(v_son_share / p_total_amount * 100, 2)
      WHEN b.relationship = 'بنت' THEN ROUND(v_daughter_share / p_total_amount * 100, 2)
      ELSE 0
    END
  FROM beneficiaries b
  WHERE b.status = 'نشط'
    AND b.relationship IN ('زوجة', 'ابن', 'بنت');
END;
$$;

-- تعليق توثيقي
COMMENT ON FUNCTION public.calculate_shariah_distribution(numeric) IS 
  'دالة حساب التوزيع الشرعي - مؤمنة بفحص الصلاحيات (nazer/admin/accountant) - فحص جنائي 2026-01-19';