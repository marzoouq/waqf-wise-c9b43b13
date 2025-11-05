-- إضافة بيانات تجريبية للنظام المحاسبي

-- 1. تحديث الهيكل الصحيح لشجرة الحسابات (تحديث parent_id)
-- تحديث الحسابات الفرعية تحت الأصول المتداولة
UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '11') 
WHERE code IN ('111', '112') AND parent_id IS NULL;

-- تحديث الحسابات الفرعية تحت الأصول الثابتة
UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '12') 
WHERE code IN ('121', '122') AND parent_id IS NULL;

-- تحديث الأصول المتداولة والثابتة تحت الأصول الرئيسية
UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '1') 
WHERE code IN ('11', '12') AND parent_id IS NULL;

-- 2. إضافة حسابات إضافية (الخصوم، حقوق الملكية، الإيرادات، المصروفات)

-- الخصوم (2xx)
INSERT INTO accounts (code, name_ar, name_en, account_type, account_nature, is_header, is_active) VALUES
('2', 'الخصوم', 'Liabilities', 'liability', 'credit', true, true),
('21', 'خصوم متداولة', 'Current Liabilities', 'liability', 'credit', true, true),
('211', 'حسابات دائنة', 'Accounts Payable', 'liability', 'credit', false, true),
('212', 'قروض قصيرة الأجل', 'Short-term Loans', 'liability', 'credit', false, true),
('22', 'خصوم طويلة الأجل', 'Long-term Liabilities', 'liability', 'credit', true, true),
('221', 'قروض طويلة الأجل', 'Long-term Loans', 'liability', 'credit', false, true)
ON CONFLICT (code) DO NOTHING;

-- تحديث parent_id للخصوم
UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '2') 
WHERE code IN ('21', '22') AND parent_id IS NULL;

UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '21') 
WHERE code IN ('211', '212') AND parent_id IS NULL;

UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '22') 
WHERE code = '221' AND parent_id IS NULL;

-- حقوق الملكية (3xx)
INSERT INTO accounts (code, name_ar, name_en, account_type, account_nature, is_header, is_active) VALUES
('3', 'حقوق الملكية', 'Equity', 'equity', 'credit', true, true),
('31', 'رأس المال', 'Capital', 'equity', 'credit', false, true),
('32', 'الأرباح المحتجزة', 'Retained Earnings', 'equity', 'credit', false, true),
('33', 'أرباح السنة الحالية', 'Current Year Profit', 'equity', 'credit', false, true)
ON CONFLICT (code) DO NOTHING;

-- تحديث parent_id لحقوق الملكية
UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '3') 
WHERE code IN ('31', '32', '33') AND parent_id IS NULL;

-- الإيرادات (4xx)
INSERT INTO accounts (code, name_ar, name_en, account_type, account_nature, is_header, is_active) VALUES
('4', 'الإيرادات', 'Revenue', 'revenue', 'credit', true, true),
('41', 'إيرادات التشغيل', 'Operating Revenue', 'revenue', 'credit', true, true),
('411', 'إيرادات المبيعات', 'Sales Revenue', 'revenue', 'credit', false, true),
('412', 'إيرادات الخدمات', 'Service Revenue', 'revenue', 'credit', false, true),
('42', 'إيرادات أخرى', 'Other Revenue', 'revenue', 'credit', false, true)
ON CONFLICT (code) DO NOTHING;

-- تحديث parent_id للإيرادات
UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '4') 
WHERE code IN ('41', '42') AND parent_id IS NULL;

UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '41') 
WHERE code IN ('411', '412') AND parent_id IS NULL;

-- المصروفات (5xx)
INSERT INTO accounts (code, name_ar, name_en, account_type, account_nature, is_header, is_active) VALUES
('5', 'المصروفات', 'Expenses', 'expense', 'debit', true, true),
('51', 'مصروفات التشغيل', 'Operating Expenses', 'expense', 'debit', true, true),
('511', 'رواتب وأجور', 'Salaries and Wages', 'expense', 'debit', false, true),
('512', 'إيجارات', 'Rent', 'expense', 'debit', false, true),
('513', 'مصروفات كهرباء ومياه', 'Utilities', 'expense', 'debit', false, true),
('52', 'مصروفات إدارية', 'Administrative Expenses', 'expense', 'debit', true, true),
('521', 'قرطاسية', 'Stationery', 'expense', 'debit', false, true),
('522', 'اتصالات', 'Communications', 'expense', 'debit', false, true)
ON CONFLICT (code) DO NOTHING;

-- تحديث parent_id للمصروفات
UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '5') 
WHERE code IN ('51', '52') AND parent_id IS NULL;

UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '51') 
WHERE code IN ('511', '512', '513') AND parent_id IS NULL;

UPDATE accounts SET parent_id = (SELECT id FROM accounts WHERE code = '52') 
WHERE code IN ('521', '522') AND parent_id IS NULL;

-- 3. إضافة سنوات مالية إضافية
INSERT INTO fiscal_years (name, start_date, end_date, is_active, is_closed) VALUES
('السنة المالية 2023', '2023-01-01', '2023-12-31', false, true),
('السنة المالية 2025', '2025-01-01', '2025-12-31', false, false)
ON CONFLICT DO NOTHING;

-- 4. إضافة قيود محاسبية نموذجية
DO $$
DECLARE
    v_fiscal_year_id uuid;
    v_entry_id uuid;
    v_cash_account_id uuid;
    v_capital_account_id uuid;
    v_sales_account_id uuid;
    v_salary_account_id uuid;
    v_rent_account_id uuid;
BEGIN
    -- الحصول على السنة المالية النشطة
    SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE is_active = true AND is_closed = false LIMIT 1;
    
    -- الحصول على معرفات الحسابات
    SELECT id INTO v_cash_account_id FROM accounts WHERE code = '111';
    SELECT id INTO v_capital_account_id FROM accounts WHERE code = '31';
    SELECT id INTO v_sales_account_id FROM accounts WHERE code = '411';
    SELECT id INTO v_salary_account_id FROM accounts WHERE code = '511';
    SELECT id INTO v_rent_account_id FROM accounts WHERE code = '512';
    
    IF v_fiscal_year_id IS NOT NULL THEN
        -- قيد افتتاحي: رأس المال
        INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, status)
        VALUES ('JV-2024-001', '2024-01-01', 'قيد افتتاحي - رأس المال', v_fiscal_year_id, 'posted')
        RETURNING id INTO v_entry_id;
        
        INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, description, debit_amount, credit_amount)
        VALUES 
            (v_entry_id, 1, v_cash_account_id, 'نقدية بالصندوق', 500000, 0),
            (v_entry_id, 2, v_capital_account_id, 'رأس المال', 0, 500000);
        
        -- قيد إيرادات
        INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, status)
        VALUES ('JV-2024-002', '2024-01-15', 'إيرادات مبيعات نقدية', v_fiscal_year_id, 'posted')
        RETURNING id INTO v_entry_id;
        
        INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, description, debit_amount, credit_amount)
        VALUES 
            (v_entry_id, 1, v_cash_account_id, 'نقدية من المبيعات', 150000, 0),
            (v_entry_id, 2, v_sales_account_id, 'إيرادات المبيعات', 0, 150000);
        
        -- قيد مصروفات رواتب
        INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, status)
        VALUES ('JV-2024-003', '2024-01-31', 'صرف رواتب شهر يناير', v_fiscal_year_id, 'posted')
        RETURNING id INTO v_entry_id;
        
        INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, description, debit_amount, credit_amount)
        VALUES 
            (v_entry_id, 1, v_salary_account_id, 'رواتب يناير', 80000, 0),
            (v_entry_id, 2, v_cash_account_id, 'دفع نقدي', 0, 80000);
        
        -- قيد مصروفات إيجار
        INSERT INTO journal_entries (entry_number, entry_date, description, fiscal_year_id, status)
        VALUES ('JV-2024-004', '2024-02-01', 'إيجار شهر يناير', v_fiscal_year_id, 'draft')
        RETURNING id INTO v_entry_id;
        
        INSERT INTO journal_entry_lines (journal_entry_id, line_number, account_id, description, debit_amount, credit_amount)
        VALUES 
            (v_entry_id, 1, v_rent_account_id, 'إيجار المكتب', 25000, 0),
            (v_entry_id, 2, v_cash_account_id, 'دفع نقدي', 0, 25000);
    END IF;
END $$;

-- 5. إضافة ميزانيات نموذجية
DO $$
DECLARE
    v_fiscal_year_id uuid;
    v_sales_account_id uuid;
    v_salary_account_id uuid;
    v_rent_account_id uuid;
BEGIN
    -- الحصول على السنة المالية النشطة
    SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE is_active = true AND is_closed = false LIMIT 1;
    
    -- الحصول على معرفات الحسابات
    SELECT id INTO v_sales_account_id FROM accounts WHERE code = '411';
    SELECT id INTO v_salary_account_id FROM accounts WHERE code = '511';
    SELECT id INTO v_rent_account_id FROM accounts WHERE code = '512';
    
    IF v_fiscal_year_id IS NOT NULL THEN
        -- ميزانيات شهرية للإيرادات
        INSERT INTO budgets (fiscal_year_id, account_id, period_type, period_number, budgeted_amount, actual_amount, variance_amount)
        VALUES 
            (v_fiscal_year_id, v_sales_account_id, 'monthly', 1, 200000, 150000, -50000),
            (v_fiscal_year_id, v_sales_account_id, 'monthly', 2, 200000, 0, -200000),
            (v_fiscal_year_id, v_sales_account_id, 'monthly', 3, 200000, 0, -200000);
        
        -- ميزانيات شهرية للرواتب
        INSERT INTO budgets (fiscal_year_id, account_id, period_type, period_number, budgeted_amount, actual_amount, variance_amount)
        VALUES 
            (v_fiscal_year_id, v_salary_account_id, 'monthly', 1, 85000, 80000, 5000),
            (v_fiscal_year_id, v_salary_account_id, 'monthly', 2, 85000, 0, 85000),
            (v_fiscal_year_id, v_salary_account_id, 'monthly', 3, 85000, 0, 85000);
        
        -- ميزانيات شهرية للإيجار
        INSERT INTO budgets (fiscal_year_id, account_id, period_type, period_number, budgeted_amount, actual_amount, variance_amount)
        VALUES 
            (v_fiscal_year_id, v_rent_account_id, 'monthly', 1, 25000, 25000, 0),
            (v_fiscal_year_id, v_rent_account_id, 'monthly', 2, 25000, 0, 25000),
            (v_fiscal_year_id, v_rent_account_id, 'monthly', 3, 25000, 0, 25000);
        
        -- ميزانية ربع سنوية للإيرادات
        INSERT INTO budgets (fiscal_year_id, account_id, period_type, period_number, budgeted_amount, actual_amount, variance_amount)
        VALUES 
            (v_fiscal_year_id, v_sales_account_id, 'quarterly', 1, 600000, 150000, -450000);
    END IF;
END $$;