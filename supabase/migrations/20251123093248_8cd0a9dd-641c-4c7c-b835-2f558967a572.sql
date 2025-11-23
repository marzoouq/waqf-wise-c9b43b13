-- إضافة حساب ضريبة القيمة المضافة ضمن الخصوم المتداولة

-- الحصول على parent_id للخصوم المتداولة
DO $$
DECLARE
  current_liabilities_id UUID;
BEGIN
  -- الحصول على معرف الخصوم المتداولة
  SELECT id INTO current_liabilities_id 
  FROM accounts 
  WHERE code = '21';

  -- إضافة حساب ضريبة القيمة المضافة
  INSERT INTO accounts (
    code,
    name_ar,
    name_en,
    account_type,
    account_nature,
    is_header,
    is_active,
    parent_id,
    current_balance,
    description
  ) VALUES (
    '2130',
    'ضريبة القيمة المضافة المستحقة',
    'VAT Payable',
    'liability',
    'credit',
    false,
    true,
    current_liabilities_id,
    0,
    'حساب لتسجيل ضريبة القيمة المضافة المستحقة للهيئة'
  ) ON CONFLICT (code) DO NOTHING;

  -- إضافة حساب إيرادات الإيجارات (صافي بدون ضريبة)
  INSERT INTO accounts (
    code,
    name_ar,
    name_en,
    account_type,
    account_nature,
    is_header,
    is_active,
    current_balance,
    description
  ) VALUES (
    '4110',
    'إيرادات الإيجارات',
    'Rental Revenue',
    'revenue',
    'credit',
    false,
    true,
    0,
    'إيرادات من إيجار العقارات (صافي بدون ضريبة)'
  ) ON CONFLICT (code) DO NOTHING;
END $$;