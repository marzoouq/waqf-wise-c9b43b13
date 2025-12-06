-- إضافة أعمدة النشر لجدول السنوات المالية
ALTER TABLE fiscal_years 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS published_by UUID;

-- إضافة تعليق للأعمدة الجديدة
COMMENT ON COLUMN fiscal_years.is_published IS 'هل تم نشر السنة المالية للورثة';
COMMENT ON COLUMN fiscal_years.published_at IS 'تاريخ ووقت النشر';
COMMENT ON COLUMN fiscal_years.published_by IS 'من قام بالنشر';

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_fiscal_years_is_published ON fiscal_years(is_published);

-- سياسة التوزيعات - تظهر للورثة فوراً (بغض النظر عن حالة النشر)
DROP POLICY IF EXISTS "heirs_see_own_distributions_immediately" ON heir_distributions;
CREATE POLICY "heirs_see_own_distributions_immediately" ON heir_distributions
FOR SELECT TO authenticated
USING (
  -- الموظفون يرون كل التوزيعات
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('nazer', 'admin', 'accountant', 'cashier')
  )
  OR
  -- الورثة يرون توزيعاتهم فوراً
  (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'waqf_heir'
    )
    AND beneficiary_id IN (
      SELECT id FROM beneficiaries WHERE user_id = auth.uid()
    )
  )
);

-- إنشاء دالة للتحقق من حالة النشر
CREATE OR REPLACE FUNCTION is_fiscal_year_published(fy_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(is_published, false) FROM fiscal_years WHERE id = fy_id;
$$;

-- إنشاء دالة لحساب حصص الورثة الشرعية
CREATE OR REPLACE FUNCTION calculate_shariah_distribution(p_total_amount NUMERIC)
RETURNS TABLE(
  beneficiary_id UUID,
  heir_type TEXT,
  share_amount NUMERIC,
  share_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_wives_count INTEGER;
  v_sons_count INTEGER;
  v_daughters_count INTEGER;
  v_wives_share NUMERIC;
  v_remaining NUMERIC;
  v_son_share NUMERIC;
  v_daughter_share NUMERIC;
  v_total_parts NUMERIC;
BEGIN
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