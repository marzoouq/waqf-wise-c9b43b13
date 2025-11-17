-- تحسين دالة توليد الإفصاح السنوي
-- ربط المصروفات من جداول المحاسبة وحساب الأرصدة تلقائياً

CREATE OR REPLACE FUNCTION public.calculate_disclosure_balances(
  p_fiscal_year_id UUID,
  p_period_start DATE,
  p_period_end DATE
) RETURNS TABLE (
  opening_balance NUMERIC,
  closing_balance NUMERIC,
  total_revenues NUMERIC,
  total_expenses NUMERIC,
  administrative_expenses NUMERIC,
  maintenance_expenses NUMERIC,
  development_expenses NUMERIC,
  other_expenses NUMERIC
) AS $$
DECLARE
  v_opening NUMERIC := 0;
  v_closing NUMERIC := 0;
  v_revenues NUMERIC := 0;
  v_expenses NUMERIC := 0;
  v_admin_exp NUMERIC := 0;
  v_maint_exp NUMERIC := 0;
  v_dev_exp NUMERIC := 0;
  v_other_exp NUMERIC := 0;
BEGIN
  -- حساب الرصيد الافتتاحي (من البنوك والصناديق في بداية الفترة)
  SELECT COALESCE(SUM(current_balance), 0)
  INTO v_opening
  FROM bank_accounts
  WHERE created_at < p_period_start;

  -- حساب إجمالي الإيرادات من القيود اليومية
  SELECT COALESCE(SUM(debit_amount), 0)
  INTO v_revenues
  FROM journal_entry_lines jel
  INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
  INNER JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_period_start AND p_period_end
    AND a.account_type = 'revenue'
    AND je.status = 'posted';

  -- حساب المصروفات الإدارية
  SELECT COALESCE(SUM(credit_amount), 0)
  INTO v_admin_exp
  FROM journal_entry_lines jel
  INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
  INNER JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_period_start AND p_period_end
    AND a.account_type = 'expense'
    AND a.name_ar ILIKE '%إدار%'
    AND je.status = 'posted';

  -- حساب مصروفات الصيانة
  SELECT COALESCE(SUM(credit_amount), 0)
  INTO v_maint_exp
  FROM journal_entry_lines jel
  INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
  INNER JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_period_start AND p_period_end
    AND a.account_type = 'expense'
    AND (a.name_ar ILIKE '%صيانة%' OR a.name_ar ILIKE '%ترميم%')
    AND je.status = 'posted';

  -- حساب مصروفات التطوير
  SELECT COALESCE(SUM(credit_amount), 0)
  INTO v_dev_exp
  FROM journal_entry_lines jel
  INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
  INNER JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_period_start AND p_period_end
    AND a.account_type = 'expense'
    AND (a.name_ar ILIKE '%تطوير%' OR a.name_ar ILIKE '%تحسين%')
    AND je.status = 'posted';

  -- حساب باقي المصروفات
  SELECT COALESCE(SUM(credit_amount), 0)
  INTO v_expenses
  FROM journal_entry_lines jel
  INNER JOIN journal_entries je ON jel.journal_entry_id = je.id
  INNER JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_period_start AND p_period_end
    AND a.account_type = 'expense'
    AND je.status = 'posted';

  v_other_exp := v_expenses - v_admin_exp - v_maint_exp - v_dev_exp;

  -- حساب الرصيد الختامي
  v_closing := v_opening + v_revenues - v_expenses;

  RETURN QUERY SELECT 
    v_opening,
    v_closing,
    v_revenues,
    v_expenses,
    v_admin_exp,
    v_maint_exp,
    v_dev_exp,
    v_other_exp;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- تحديث دالة توليد الإفصاح لاستخدام الدالة الجديدة
CREATE OR REPLACE FUNCTION public.generate_annual_disclosure(
  p_year INTEGER,
  p_waqf_name TEXT
) RETURNS UUID AS $$
DECLARE
  v_disclosure_id UUID;
  v_fiscal_year_id UUID;
  v_total_revenues NUMERIC;
  v_total_expenses NUMERIC;
  v_nazer_share NUMERIC;
  v_charity_share NUMERIC;
  v_corpus_share NUMERIC;
  v_sons_count INTEGER;
  v_daughters_count INTEGER;
  v_wives_count INTEGER;
  v_beneficiaries_count INTEGER;
  v_opening_balance NUMERIC;
  v_closing_balance NUMERIC;
  v_admin_exp NUMERIC;
  v_maint_exp NUMERIC;
  v_dev_exp NUMERIC;
  v_other_exp NUMERIC;
  v_nazer_pct NUMERIC;
  v_charity_pct NUMERIC;
  v_corpus_pct NUMERIC;
  v_period_start DATE;
  v_period_end DATE;
BEGIN
  -- البحث عن السنة المالية
  SELECT id, start_date, end_date
  INTO v_fiscal_year_id, v_period_start, v_period_end
  FROM fiscal_years
  WHERE year_number = p_year
  LIMIT 1;

  IF v_fiscal_year_id IS NULL THEN
    RAISE EXCEPTION 'السنة المالية % غير موجودة', p_year;
  END IF;

  -- الحصول على إعدادات التوزيع
  SELECT 
    nazer_percentage,
    waqif_charity_percentage,
    waqf_corpus_percentage
  INTO v_nazer_pct, v_charity_pct, v_corpus_pct
  FROM waqf_distribution_settings
  ORDER BY updated_at DESC
  LIMIT 1;

  -- استخدام قيم افتراضية إذا لم توجد إعدادات
  v_nazer_pct := COALESCE(v_nazer_pct, 10);
  v_charity_pct := COALESCE(v_charity_pct, 5);
  v_corpus_pct := COALESCE(v_corpus_pct, 0);

  -- حساب الأرصدة والمصروفات من المحاسبة
  SELECT *
  INTO v_opening_balance, v_closing_balance, v_total_revenues, 
       v_total_expenses, v_admin_exp, v_maint_exp, v_dev_exp, v_other_exp
  FROM calculate_disclosure_balances(v_fiscal_year_id, v_period_start, v_period_end);

  -- حساب صافي الدخل القابل للتوزيع
  DECLARE
    v_net_income NUMERIC := v_total_revenues - v_total_expenses;
  BEGIN
    -- حساب الحصص
    v_nazer_share := (v_net_income * v_nazer_pct / 100);
    v_charity_share := (v_net_income * v_charity_pct / 100);
    v_corpus_share := (v_net_income * v_corpus_pct / 100);
    
    -- صافي الدخل بعد الاستقطاعات
    v_net_income := v_net_income - v_nazer_share - v_charity_share - v_corpus_share;
  END;

  -- حساب عدد المستفيدين
  SELECT 
    COUNT(*) FILTER (WHERE gender = 'ذكر' AND relationship IN ('ابن', 'حفيد')),
    COUNT(*) FILTER (WHERE gender = 'أنثى' AND relationship IN ('بنت', 'حفيدة')),
    COUNT(*) FILTER (WHERE relationship = 'زوجة'),
    COUNT(*)
  INTO v_sons_count, v_daughters_count, v_wives_count, v_beneficiaries_count
  FROM beneficiaries
  WHERE status = 'نشط';

  -- إنشاء سجل الإفصاح
  INSERT INTO annual_disclosures (
    year,
    waqf_name,
    fiscal_year_id,
    disclosure_date,
    opening_balance,
    closing_balance,
    total_revenues,
    total_expenses,
    administrative_expenses,
    maintenance_expenses,
    development_expenses,
    other_expenses,
    net_income,
    nazer_percentage,
    nazer_share,
    charity_percentage,
    charity_share,
    corpus_percentage,
    corpus_share,
    sons_count,
    daughters_count,
    wives_count,
    total_beneficiaries,
    status
  ) VALUES (
    p_year,
    p_waqf_name,
    v_fiscal_year_id,
    CURRENT_DATE,
    v_opening_balance,
    v_closing_balance,
    v_total_revenues,
    v_total_expenses,
    v_admin_exp,
    v_maint_exp,
    v_dev_exp,
    v_other_exp,
    v_total_revenues - v_total_expenses,
    v_nazer_pct,
    v_nazer_share,
    v_charity_pct,
    v_charity_share,
    v_corpus_pct,
    v_corpus_share,
    v_sons_count,
    v_daughters_count,
    v_wives_count,
    v_beneficiaries_count,
    'draft'
  )
  RETURNING id INTO v_disclosure_id;

  RETURN v_disclosure_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;