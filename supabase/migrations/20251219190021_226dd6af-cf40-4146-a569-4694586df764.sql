
-- ====================================
-- المرحلة السابعة: Composite Indexes + Materialized Views + تحسينات
-- ====================================

-- 1. Composite Indexes للاستعلامات المعقدة

-- Journal entries: البحث بالتاريخ والحالة
CREATE INDEX IF NOT EXISTS idx_je_date_status ON journal_entries(entry_date, status);

-- Journal entry lines: البحث بالحساب والقيد
CREATE INDEX IF NOT EXISTS idx_jel_account_entry ON journal_entry_lines(account_id, journal_entry_id);

-- Distributions: البحث بالتاريخ والحالة
CREATE INDEX IF NOT EXISTS idx_dist_date_status ON distributions(distribution_date, status);

-- Distribution details: البحث بالتوزيع والمستفيد
CREATE INDEX IF NOT EXISTS idx_dd_dist_benef ON distribution_details(distribution_id, beneficiary_id);

-- Beneficiaries: البحث بالفئة والحالة
CREATE INDEX IF NOT EXISTS idx_ben_cat_status ON beneficiaries(category, status);

-- Contracts: البحث بالعقار والحالة
CREATE INDEX IF NOT EXISTS idx_con_prop_status ON contracts(property_id, status);

-- Invoices: البحث بالتاريخ والحالة
CREATE INDEX IF NOT EXISTS idx_inv_date_status ON invoices(invoice_date, status);

-- Loans: البحث بالمستفيد والحالة
CREATE INDEX IF NOT EXISTS idx_loan_ben_status ON loans(beneficiary_id, status);

-- Payments: البحث بالتاريخ والنوع
CREATE INDEX IF NOT EXISTS idx_pay_date_type ON payments(payment_date, payment_type);

-- Audit logs: البحث بالجدول والتاريخ
CREATE INDEX IF NOT EXISTS idx_audit_table_date ON audit_logs(table_name, created_at);

-- Approval status: البحث بالنوع والحالة
CREATE INDEX IF NOT EXISTS idx_approval_type_status ON approval_status(entity_type, status);

-- 2. Partial Indexes للبيانات النشطة فقط

-- المستفيدين النشطين فقط
CREATE INDEX IF NOT EXISTS idx_ben_active ON beneficiaries(id) WHERE status = 'نشط';

-- العقود النشطة فقط
CREATE INDEX IF NOT EXISTS idx_con_active ON contracts(id, property_id) WHERE status = 'نشط';

-- القيود المرحّلة فقط
CREATE INDEX IF NOT EXISTS idx_je_posted ON journal_entries(id, entry_date) WHERE status = 'posted';

-- القروض النشطة فقط
CREATE INDEX IF NOT EXISTS idx_loan_active ON loans(id, beneficiary_id) WHERE status IN ('نشط', 'approved');

-- الموافقات المعلقة فقط
CREATE INDEX IF NOT EXISTS idx_approval_pending ON approval_status(id, entity_type) WHERE status = 'pending';

-- 3. Function لتحديث إحصائيات الجداول
CREATE OR REPLACE FUNCTION public.refresh_table_statistics()
RETURNS void AS $$
BEGIN
  ANALYZE accounts;
  ANALYZE journal_entries;
  ANALYZE journal_entry_lines;
  ANALYZE beneficiaries;
  ANALYZE distributions;
  ANALYZE distribution_details;
  ANALYZE properties;
  ANALYZE contracts;
  ANALYZE invoices;
  ANALYZE loans;
  ANALYZE payments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. Function للتقرير المالي الشامل
CREATE OR REPLACE FUNCTION public.get_financial_report(
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  report_section TEXT,
  description TEXT,
  amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  -- الإيرادات
  SELECT 'إيرادات'::TEXT, a.name_ar, 
    SUM(jel.credit_amount - jel.debit_amount)
  FROM journal_entry_lines jel
  JOIN journal_entries je ON jel.journal_entry_id = je.id
  JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_start_date AND p_end_date
    AND je.status = 'posted' AND a.account_type = 'revenue'
  GROUP BY a.name_ar
  
  UNION ALL
  
  -- المصروفات
  SELECT 'مصروفات'::TEXT, a.name_ar, 
    SUM(jel.debit_amount - jel.credit_amount)
  FROM journal_entry_lines jel
  JOIN journal_entries je ON jel.journal_entry_id = je.id
  JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_start_date AND p_end_date
    AND je.status = 'posted' AND a.account_type = 'expense'
  GROUP BY a.name_ar
  
  UNION ALL
  
  -- الإجماليات
  SELECT 'إجمالي'::TEXT, 'إجمالي الإيرادات'::TEXT,
    COALESCE(SUM(CASE WHEN a.account_type = 'revenue' THEN jel.credit_amount - jel.debit_amount ELSE 0 END), 0)
  FROM journal_entry_lines jel
  JOIN journal_entries je ON jel.journal_entry_id = je.id
  JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_start_date AND p_end_date AND je.status = 'posted'
  
  UNION ALL
  
  SELECT 'إجمالي'::TEXT, 'إجمالي المصروفات'::TEXT,
    COALESCE(SUM(CASE WHEN a.account_type = 'expense' THEN jel.debit_amount - jel.credit_amount ELSE 0 END), 0)
  FROM journal_entry_lines jel
  JOIN journal_entries je ON jel.journal_entry_id = je.id
  JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_start_date AND p_end_date AND je.status = 'posted'
  
  UNION ALL
  
  SELECT 'إجمالي'::TEXT, 'صافي الدخل'::TEXT,
    COALESCE(SUM(CASE WHEN a.account_type = 'revenue' THEN jel.credit_amount - jel.debit_amount 
                      WHEN a.account_type = 'expense' THEN -(jel.debit_amount - jel.credit_amount) ELSE 0 END), 0)
  FROM journal_entry_lines jel
  JOIN journal_entries je ON jel.journal_entry_id = je.id
  JOIN accounts a ON jel.account_id = a.id
  WHERE je.entry_date BETWEEN p_start_date AND p_end_date AND je.status = 'posted';
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- 5. Function لملخص الوقف الشامل
CREATE OR REPLACE FUNCTION public.get_waqf_summary()
RETURNS TABLE (
  metric_name TEXT,
  metric_value NUMERIC,
  metric_unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 'إجمالي المستفيدين'::TEXT, COUNT(*)::NUMERIC, 'مستفيد'::TEXT FROM beneficiaries
  UNION ALL
  SELECT 'المستفيدين النشطين', COUNT(*)::NUMERIC, 'مستفيد' FROM beneficiaries WHERE status = 'نشط'
  UNION ALL
  SELECT 'إجمالي العقارات', COUNT(*)::NUMERIC, 'عقار' FROM properties
  UNION ALL
  SELECT 'العقود النشطة', COUNT(*)::NUMERIC, 'عقد' FROM contracts WHERE status = 'نشط'
  UNION ALL
  SELECT 'إجمالي الإيجارات الشهرية', COALESCE(SUM(monthly_rent), 0), 'ريال' FROM contracts WHERE status = 'نشط'
  UNION ALL
  SELECT 'رصيد البنوك', COALESCE(SUM(current_balance), 0), 'ريال' FROM bank_accounts WHERE is_active = true
  UNION ALL
  SELECT 'القروض النشطة', COUNT(*)::NUMERIC, 'قرض' FROM loans WHERE status IN ('نشط', 'approved')
  UNION ALL
  SELECT 'إجمالي القروض المستحقة', COALESCE(SUM(remaining_balance), 0), 'ريال' FROM loans WHERE status IN ('نشط', 'approved')
  UNION ALL
  SELECT 'التوزيعات المعلقة', COUNT(*)::NUMERIC, 'توزيع' FROM distributions WHERE status = 'معلق'
  UNION ALL
  SELECT 'الموافقات المعلقة', COUNT(*)::NUMERIC, 'موافقة' FROM approval_status WHERE status = 'pending';
END;
$$ LANGUAGE plpgsql STABLE SET search_path = public;

-- 6. View لأداء العقارات
CREATE OR REPLACE VIEW public.property_performance WITH (security_invoker = true) AS
SELECT 
  p.id,
  p.name,
  p.type,
  p.total_units,
  p.occupied_units,
  CASE WHEN p.total_units > 0 THEN ROUND((p.occupied_units::NUMERIC / p.total_units) * 100, 2) ELSE 0 END as occupancy_rate,
  COALESCE(p.monthly_revenue, 0) as current_monthly_revenue,
  COALESCE((SELECT SUM(monthly_rent) FROM contracts c WHERE c.property_id = p.id AND c.status = 'نشط'), 0) as contracted_monthly_revenue,
  (SELECT COUNT(*) FROM contracts c WHERE c.property_id = p.id AND c.status = 'نشط') as active_contracts_count,
  (SELECT COUNT(*) FROM maintenance_requests m WHERE m.property_id = p.id AND m.status IN ('pending', 'in_progress')) as pending_maintenance
FROM properties p;

-- 7. View للتنبيهات المالية
CREATE OR REPLACE VIEW public.financial_alerts WITH (security_invoker = true) AS
SELECT 
  'contract_expiring' as alert_type,
  'عقد ينتهي قريباً' as alert_title,
  c.contract_number as reference,
  c.end_date as alert_date,
  p.name as related_entity
FROM contracts c
JOIN properties p ON c.property_id = p.id
WHERE c.status = 'نشط' AND c.end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'

UNION ALL

SELECT 
  'loan_overdue' as alert_type,
  'قسط قرض متأخر' as alert_title,
  l.loan_number as reference,
  li.due_date as alert_date,
  b.full_name as related_entity
FROM loan_installments li
JOIN loans l ON li.loan_id = l.id
JOIN beneficiaries b ON l.beneficiary_id = b.id
WHERE li.status = 'معلق' AND li.due_date < CURRENT_DATE

UNION ALL

SELECT 
  'pending_approval' as alert_type,
  'موافقة معلقة' as alert_title,
  ast.entity_type as reference,
  ast.created_at::DATE as alert_date,
  ast.entity_type as related_entity
FROM approval_status ast
WHERE ast.status = 'pending' AND ast.created_at < CURRENT_TIMESTAMP - INTERVAL '3 days';
