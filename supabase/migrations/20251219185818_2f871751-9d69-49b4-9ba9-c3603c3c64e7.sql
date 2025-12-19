
-- ====================================
-- المرحلة السادسة: Constraints + Functions + تحسينات
-- ====================================

-- 1. إضافة Constraints للتحقق من صحة البيانات

-- التأكد من أن المبالغ موجبة
ALTER TABLE journal_entry_lines 
  DROP CONSTRAINT IF EXISTS chk_jel_amounts_positive;
ALTER TABLE journal_entry_lines 
  ADD CONSTRAINT chk_jel_amounts_positive 
  CHECK (debit_amount >= 0 AND credit_amount >= 0);

ALTER TABLE distributions 
  DROP CONSTRAINT IF EXISTS chk_dist_amount_positive;
ALTER TABLE distributions 
  ADD CONSTRAINT chk_dist_amount_positive 
  CHECK (total_amount >= 0);

ALTER TABLE distribution_details 
  DROP CONSTRAINT IF EXISTS chk_dd_amount_positive;
ALTER TABLE distribution_details 
  ADD CONSTRAINT chk_dd_amount_positive 
  CHECK (allocated_amount >= 0);

ALTER TABLE loans 
  DROP CONSTRAINT IF EXISTS chk_loan_amount_positive;
ALTER TABLE loans 
  ADD CONSTRAINT chk_loan_amount_positive 
  CHECK (loan_amount >= 0);

ALTER TABLE invoices 
  DROP CONSTRAINT IF EXISTS chk_invoice_amount_positive;
ALTER TABLE invoices 
  ADD CONSTRAINT chk_invoice_amount_positive 
  CHECK (total_amount >= 0);

-- 2. Functions إضافية للعمليات المعقدة

-- Function لإنشاء توزيع جديد مع التفاصيل
CREATE OR REPLACE FUNCTION public.create_distribution_with_details(
  p_distribution_date DATE,
  p_total_amount NUMERIC,
  p_distribution_type TEXT,
  p_waqf_name TEXT,
  p_nazer_percentage NUMERIC DEFAULT 10,
  p_charity_percentage NUMERIC DEFAULT 5,
  p_corpus_percentage NUMERIC DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_dist_id UUID;
  v_nazer_share NUMERIC;
  v_charity_share NUMERIC;
  v_corpus_share NUMERIC;
  v_distributable NUMERIC;
  v_ben_count INTEGER;
BEGIN
  -- حساب الحصص
  v_nazer_share := p_total_amount * p_nazer_percentage / 100;
  v_charity_share := p_total_amount * p_charity_percentage / 100;
  v_corpus_share := p_total_amount * p_corpus_percentage / 100;
  v_distributable := p_total_amount - v_nazer_share - v_charity_share - v_corpus_share;
  
  -- عدد المستفيدين النشطين
  SELECT COUNT(*) INTO v_ben_count FROM beneficiaries WHERE status = 'نشط';
  
  -- إنشاء التوزيع
  INSERT INTO distributions (
    distribution_date, total_amount, status, beneficiaries_count,
    distribution_type, waqf_name, nazer_share, waqif_charity, waqf_corpus,
    distributable_amount, nazer_percentage, charity_percentage, corpus_percentage
  ) VALUES (
    p_distribution_date, p_total_amount, 'معلق', v_ben_count,
    p_distribution_type, p_waqf_name, v_nazer_share, v_charity_share, v_corpus_share,
    v_distributable, p_nazer_percentage, p_charity_percentage, p_corpus_percentage
  ) RETURNING id INTO v_dist_id;
  
  RETURN v_dist_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function لحساب رصيد المستفيد
CREATE OR REPLACE FUNCTION public.calculate_beneficiary_balance(p_beneficiary_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_total_received NUMERIC := 0;
  v_total_loans NUMERIC := 0;
  v_total_paid NUMERIC := 0;
BEGIN
  -- إجمالي المبالغ المستلمة من التوزيعات
  SELECT COALESCE(SUM(allocated_amount), 0) INTO v_total_received
  FROM distribution_details
  WHERE beneficiary_id = p_beneficiary_id AND payment_status = 'paid';
  
  -- إجمالي القروض
  SELECT COALESCE(SUM(loan_amount), 0) INTO v_total_loans
  FROM loans
  WHERE beneficiary_id = p_beneficiary_id AND status IN ('نشط', 'approved');
  
  -- إجمالي المدفوع من القروض
  SELECT COALESCE(SUM(paid_amount), 0) INTO v_total_paid
  FROM loans
  WHERE beneficiary_id = p_beneficiary_id;
  
  RETURN v_total_received - (v_total_loans - v_total_paid);
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function لإحصائيات العقارات
CREATE OR REPLACE FUNCTION public.get_property_stats(p_property_id UUID DEFAULT NULL)
RETURNS TABLE (
  property_id UUID,
  property_name TEXT,
  total_units INTEGER,
  occupied_units INTEGER,
  occupancy_rate NUMERIC,
  monthly_revenue NUMERIC,
  annual_revenue NUMERIC,
  active_contracts INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    COALESCE(p.total_units, 0)::INTEGER,
    COALESCE(p.occupied_units, 0)::INTEGER,
    CASE WHEN p.total_units > 0 THEN ROUND((p.occupied_units::NUMERIC / p.total_units) * 100, 2) ELSE 0 END,
    COALESCE(p.monthly_revenue, 0),
    COALESCE(p.monthly_revenue * 12, 0),
    (SELECT COUNT(*) FROM contracts c WHERE c.property_id = p.id AND c.status = 'نشط')::INTEGER
  FROM properties p
  WHERE p_property_id IS NULL OR p.id = p_property_id;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function لتقرير التدفقات النقدية
CREATE OR REPLACE FUNCTION public.get_cash_flow_report(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  category TEXT,
  inflows NUMERIC,
  outflows NUMERIC,
  net_flow NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH cash_movements AS (
    SELECT 
      CASE 
        WHEN a.account_type = 'revenue' THEN 'إيرادات'
        WHEN a.account_type = 'expense' THEN 'مصروفات'
        WHEN a.account_type = 'asset' AND a.name_ar ILIKE '%بنك%' THEN 'بنوك'
        WHEN a.account_type = 'asset' AND a.name_ar ILIKE '%نقد%' THEN 'نقدية'
        ELSE 'أخرى'
      END as cat,
      jel.debit_amount,
      jel.credit_amount
    FROM journal_entry_lines jel
    JOIN journal_entries je ON jel.journal_entry_id = je.id
    JOIN accounts a ON jel.account_id = a.id
    WHERE je.entry_date BETWEEN p_start_date AND p_end_date
      AND je.status = 'posted'
  )
  SELECT 
    cat,
    SUM(debit_amount),
    SUM(credit_amount),
    SUM(debit_amount - credit_amount)
  FROM cash_movements
  GROUP BY cat
  ORDER BY cat;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- Function لملخص الموافقات
CREATE OR REPLACE FUNCTION public.get_approval_summary()
RETURNS TABLE (
  entity_type TEXT,
  pending_count BIGINT,
  approved_count BIGINT,
  rejected_count BIGINT,
  avg_approval_hours NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ast.entity_type,
    COUNT(*) FILTER (WHERE ast.status = 'pending'),
    COUNT(*) FILTER (WHERE ast.status = 'approved'),
    COUNT(*) FILTER (WHERE ast.status = 'rejected'),
    ROUND(AVG(EXTRACT(EPOCH FROM (ast.completed_at - ast.started_at)) / 3600) FILTER (WHERE ast.status = 'approved'), 2)
  FROM approval_status ast
  GROUP BY ast.entity_type
  ORDER BY ast.entity_type;
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- 3. View للتقارير الشهرية
CREATE OR REPLACE VIEW public.monthly_financial_summary WITH (security_invoker = true) AS
SELECT 
  DATE_TRUNC('month', je.entry_date)::DATE as month,
  SUM(CASE WHEN a.account_type = 'revenue' THEN jel.credit_amount - jel.debit_amount ELSE 0 END) as total_revenues,
  SUM(CASE WHEN a.account_type = 'expense' THEN jel.debit_amount - jel.credit_amount ELSE 0 END) as total_expenses,
  SUM(CASE WHEN a.account_type = 'revenue' THEN jel.credit_amount - jel.debit_amount ELSE 0 END) -
  SUM(CASE WHEN a.account_type = 'expense' THEN jel.debit_amount - jel.credit_amount ELSE 0 END) as net_income,
  COUNT(DISTINCT je.id) as entries_count
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
JOIN accounts a ON jel.account_id = a.id
WHERE je.status = 'posted'
GROUP BY DATE_TRUNC('month', je.entry_date)
ORDER BY month DESC;

-- 4. View لملخص القروض النشطة
CREATE OR REPLACE VIEW public.active_loans_summary WITH (security_invoker = true) AS
SELECT 
  l.id,
  l.loan_number,
  b.full_name as beneficiary_name,
  l.loan_amount,
  l.remaining_balance,
  l.paid_amount,
  l.monthly_installment,
  l.status,
  (SELECT COUNT(*) FROM loan_installments li WHERE li.loan_id = l.id AND li.status = 'معلق') as pending_installments,
  (SELECT MIN(due_date) FROM loan_installments li WHERE li.loan_id = l.id AND li.status = 'معلق') as next_due_date
FROM loans l
JOIN beneficiaries b ON l.beneficiary_id = b.id
WHERE l.status IN ('نشط', 'approved');

-- 5. View لإحصائيات المستفيدين حسب الفئة
CREATE OR REPLACE VIEW public.beneficiaries_by_category WITH (security_invoker = true) AS
SELECT 
  category,
  COUNT(*) as total_count,
  COUNT(*) FILTER (WHERE status = 'نشط') as active_count,
  COALESCE(SUM(total_received), 0) as total_received,
  COALESCE(AVG(total_received), 0) as avg_received
FROM beneficiaries
GROUP BY category
ORDER BY total_count DESC;
