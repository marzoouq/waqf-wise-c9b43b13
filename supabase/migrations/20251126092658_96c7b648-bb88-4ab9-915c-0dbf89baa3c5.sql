-- إصلاح المشاكل الأمنية في الـ Functions

-- إعادة إنشاء calculate_distribution_shares مع search_path
CREATE OR REPLACE FUNCTION calculate_distribution_shares(
  p_total_amount DECIMAL,
  p_sons_count INTEGER,
  p_daughters_count INTEGER,
  p_wives_count INTEGER
) RETURNS TABLE (
  son_share DECIMAL,
  daughter_share DECIMAL,
  wife_share DECIMAL
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total_shares DECIMAL;
  v_son_ratio DECIMAL := 2.0;
  v_daughter_ratio DECIMAL := 1.0;
  v_wife_ratio DECIMAL := 1.0;
BEGIN
  v_total_shares := (p_sons_count * v_son_ratio) + 
                    (p_daughters_count * v_daughter_ratio) + 
                    (p_wives_count * v_wife_ratio);
  
  IF v_total_shares = 0 THEN
    RETURN QUERY SELECT 0::DECIMAL, 0::DECIMAL, 0::DECIMAL;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT 
    ROUND((p_total_amount * v_son_ratio / v_total_shares), 2),
    ROUND((p_total_amount * v_daughter_ratio / v_total_shares), 2),
    ROUND((p_total_amount * v_wife_ratio / v_total_shares), 2);
END;
$$;

-- إعادة إنشاء auto_create_distribution_journal_entry مع search_path
CREATE OR REPLACE FUNCTION auto_create_distribution_journal_entry(
  p_distribution_id UUID
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_distribution RECORD;
  v_fiscal_year_id UUID;
  v_entry_id UUID;
  v_entry_number VARCHAR;
BEGIN
  SELECT * INTO v_distribution FROM distributions WHERE id = p_distribution_id;
  
  IF v_distribution IS NULL THEN
    RAISE EXCEPTION 'Distribution not found';
  END IF;
  
  SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE is_active = true LIMIT 1;
  
  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'No active fiscal year found';
  END IF;
  
  v_entry_number := 'JE-DIST-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(p_distribution_id::TEXT, 1, 8);
  
  INSERT INTO journal_entries (
    entry_number,
    entry_date,
    fiscal_year_id,
    description,
    entry_type,
    reference_type,
    reference_id,
    status,
    distribution_id
  ) VALUES (
    v_entry_number,
    v_distribution.distribution_date,
    v_fiscal_year_id,
    'قيد توزيع - ' || v_distribution.distribution_name,
    'auto',
    'distribution',
    p_distribution_id,
    'draft',
    p_distribution_id
  ) RETURNING id INTO v_entry_id;
  
  UPDATE distributions SET journal_entry_id = v_entry_id WHERE id = p_distribution_id;
  
  RETURN v_entry_id;
END;
$$;

-- إعادة إنشاء update_distribution_timestamp مع search_path
CREATE OR REPLACE FUNCTION update_distribution_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;