# المرحلة 15: المحاسبة المتكاملة 🧮

## 📋 نظرة عامة

المرحلة 15 تركز على بناء نظام محاسبي متكامل يشمل شجرة الحسابات، القيود اليومية، دفتر الأستاذ، والتقارير المالية الشاملة.

---

## 🎯 الأهداف الرئيسية

1. ✅ شجرة حسابات متعددة المستويات (5 مستويات)
2. ✅ قيود يومية مع approval workflow
3. ✅ قيود تلقائية لجميع العمليات المالية
4. ✅ دفتر الأستاذ (General Ledger)
5. ✅ إدارة الحسابات البنكية
6. ✅ التسوية البنكية (Bank Reconciliation)
7. ✅ التقارير المالية الشاملة
8. ✅ الفواتير الإلكترونية (ZATCA Compliance)

---

## 🗄️ البنية التحتية للقاعدة

### 1. شجرة الحسابات (Chart of Accounts)

```sql
-- جدول الحسابات الرئيسي
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,                    -- رمز الحساب (1-100, 1-100-001)
  name_ar TEXT NOT NULL,                        -- اسم الحساب بالعربية
  name_en TEXT,                                 -- اسم الحساب بالإنجليزية
  parent_id UUID REFERENCES accounts(id),       -- الحساب الأب
  account_type account_type NOT NULL,           -- نوع الحساب
  account_nature account_nature NOT NULL,       -- طبيعة الحساب (مدين/دائن)
  is_header BOOLEAN DEFAULT false,              -- حساب رئيسي أم فرعي
  is_active BOOLEAN DEFAULT true,               -- نشط/غير نشط
  current_balance DECIMAL(15,2) DEFAULT 0,      -- الرصيد الحالي
  description TEXT,                             -- وصف الحساب
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enums للأنواع
CREATE TYPE account_type AS ENUM (
  'asset',           -- أصول
  'liability',       -- التزامات
  'equity',          -- حقوق ملكية
  'revenue',         -- إيرادات
  'expense'          -- مصروفات
);

CREATE TYPE account_nature AS ENUM (
  'debit',           -- مدين
  'credit'           -- دائن
);

-- Indexes للأداء
CREATE INDEX idx_accounts_parent ON accounts(parent_id);
CREATE INDEX idx_accounts_code ON accounts(code);
CREATE INDEX idx_accounts_type ON accounts(account_type);
```

### 2. القيود اليومية (Journal Entries)

```sql
-- جدول القيود اليومية
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_number TEXT NOT NULL UNIQUE,            -- رقم القيد
  entry_date DATE NOT NULL,                     -- تاريخ القيد
  entry_type entry_type DEFAULT 'manual',       -- نوع القيد
  reference_type TEXT,                          -- نوع المرجع (distribution, payment, etc.)
  reference_id UUID,                            -- معرف المرجع
  description TEXT NOT NULL,                    -- شرح القيد
  total_debit DECIMAL(15,2) DEFAULT 0,          -- إجمالي المدين
  total_credit DECIMAL(15,2) DEFAULT 0,         -- إجمالي الدائن
  status entry_status DEFAULT 'draft',          -- حالة القيد
  created_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  posted BOOLEAN DEFAULT false,                 -- مرحّل أم لا
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TYPE entry_type AS ENUM (
  'manual',          -- يدوي
  'auto',            -- تلقائي
  'adjustment',      -- تسوية
  'opening',         -- قيد افتتاحي
  'closing'          -- قيد إقفال
);

CREATE TYPE entry_status AS ENUM (
  'draft',           -- مسودة
  'pending',         -- قيد المراجعة
  'approved',        -- معتمد
  'rejected',        -- مرفوض
  'posted'           -- مرحّل
);

-- جدول تفاصيل القيد
CREATE TABLE journal_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id),
  line_number INT NOT NULL,                     -- رقم السطر
  description TEXT,                             -- شرح السطر
  debit_amount DECIMAL(15,2) DEFAULT 0,         -- المبلغ المدين
  credit_amount DECIMAL(15,2) DEFAULT 0,        -- المبلغ الدائن
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entry_lines_account ON journal_entry_lines(account_id);
```

### 3. القيود التلقائية (Auto Journal Templates)

```sql
-- جدول قوالب القيود التلقائية
CREATE TABLE auto_journal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  trigger_event TEXT NOT NULL,                  -- الحدث المحفز (payment_created, distribution_approved)
  description TEXT,
  debit_accounts JSONB NOT NULL,                -- حسابات المدين مع النسب
  credit_accounts JSONB NOT NULL,               -- حسابات الدائن مع النسب
  is_active BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,                       -- الأولوية
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- مثال على JSONB structure:
-- debit_accounts: [{"account_code": "1-100-001", "percentage": 100}]
-- credit_accounts: [{"account_code": "2-100-001", "percentage": 70}, {"account_code": "2-100-002", "percentage": 30}]

-- جدول سجل القيود التلقائية
CREATE TABLE auto_journal_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES auto_journal_templates(id),
  trigger_event TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  amount DECIMAL(15,2) NOT NULL,
  journal_entry_id UUID REFERENCES journal_entries(id),
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  metadata JSONB,
  executed_at TIMESTAMPTZ DEFAULT now()
);
```

### 4. الحسابات البنكية (Bank Accounts)

```sql
-- جدول الحسابات البنكية
CREATE TABLE bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  iban TEXT,
  swift_code TEXT,
  currency TEXT DEFAULT 'SAR',
  account_id UUID REFERENCES accounts(id),      -- ربط بشجرة الحسابات
  current_balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول كشوف الحساب البنكي
CREATE TABLE bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID REFERENCES bank_accounts(id),
  statement_date DATE NOT NULL,
  opening_balance DECIMAL(15,2) NOT NULL,
  closing_balance DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'pending',                -- pending, reconciled
  reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول معاملات البنك
CREATE TABLE bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  statement_id UUID REFERENCES bank_statements(id),
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  reference_number TEXT,
  transaction_type TEXT NOT NULL,               -- deposit, withdrawal
  amount DECIMAL(15,2) NOT NULL,
  is_matched BOOLEAN DEFAULT false,             -- مطابق مع قيد أم لا
  journal_entry_id UUID REFERENCES journal_entries(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_bank_transactions_date ON bank_transactions(transaction_date);
CREATE INDEX idx_bank_transactions_matched ON bank_transactions(is_matched);
```

### 5. التسوية البنكية (Bank Reconciliation)

```sql
-- جدول قواعد المطابقة
CREATE TABLE bank_matching_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL,                    -- شروط المطابقة
  account_mapping JSONB NOT NULL,               -- تعيين الحسابات
  priority INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  match_count INT DEFAULT 0,
  last_matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول نتائج المطابقة
CREATE TABLE bank_reconciliation_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_transaction_id UUID REFERENCES bank_transactions(id),
  journal_entry_id UUID REFERENCES journal_entries(id),
  matching_rule_id UUID REFERENCES bank_matching_rules(id),
  match_type TEXT NOT NULL,                     -- auto, manual, suggested
  confidence_score DECIMAL(5,2),                -- درجة الثقة في المطابقة
  matched_by UUID REFERENCES auth.users(id),
  matched_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);
```

---

## 🔧 الدوال والـ Triggers

### 1. دالة إنشاء قيد تلقائي

```sql
CREATE FUNCTION create_auto_journal_entry(
  p_trigger_event TEXT,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_amount DECIMAL,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_template auto_journal_templates%ROWTYPE;
  v_entry_id UUID;
  v_entry_number TEXT;
  v_account accounts%ROWTYPE;
  v_debit_account JSONB;
  v_credit_account JSONB;
BEGIN
  -- جلب القالب المناسب
  SELECT * INTO v_template
  FROM auto_journal_templates
  WHERE trigger_event = p_trigger_event
    AND is_active = true
  ORDER BY priority DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active template found for event: %', p_trigger_event;
  END IF;

  -- توليد رقم القيد
  v_entry_number := 'JE-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('journal_entry_seq')::TEXT, 6, '0');

  -- إنشاء القيد
  INSERT INTO journal_entries (
    entry_number, entry_date, entry_type, reference_type, reference_id,
    description, status, created_by
  ) VALUES (
    v_entry_number, CURRENT_DATE, 'auto', p_reference_type, p_reference_id,
    p_description, 'approved', auth.uid()
  ) RETURNING id INTO v_entry_id;

  -- إضافة سطور المدين
  FOR v_debit_account IN SELECT * FROM jsonb_array_elements(v_template.debit_accounts)
  LOOP
    SELECT * INTO v_account FROM accounts WHERE code = v_debit_account->>'account_code';
    
    INSERT INTO journal_entry_lines (
      journal_entry_id, account_id, line_number, 
      description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, v_account.id, 
      (SELECT COALESCE(MAX(line_number), 0) + 1 FROM journal_entry_lines WHERE journal_entry_id = v_entry_id),
      p_description,
      p_amount * (v_debit_account->>'percentage')::DECIMAL / 100,
      0
    );
  END LOOP;

  -- إضافة سطور الدائن
  FOR v_credit_account IN SELECT * FROM jsonb_array_elements(v_template.credit_accounts)
  LOOP
    SELECT * INTO v_account FROM accounts WHERE code = v_credit_account->>'account_code';
    
    INSERT INTO journal_entry_lines (
      journal_entry_id, account_id, line_number,
      description, debit_amount, credit_amount
    ) VALUES (
      v_entry_id, v_account.id,
      (SELECT COALESCE(MAX(line_number), 0) + 1 FROM journal_entry_lines WHERE journal_entry_id = v_entry_id),
      p_description,
      0,
      p_amount * (v_credit_account->>'percentage')::DECIMAL / 100
    );
  END LOOP;

  -- تحديث إجماليات القيد
  UPDATE journal_entries
  SET total_debit = (SELECT SUM(debit_amount) FROM journal_entry_lines WHERE journal_entry_id = v_entry_id),
      total_credit = (SELECT SUM(credit_amount) FROM journal_entry_lines WHERE journal_entry_id = v_entry_id)
  WHERE id = v_entry_id;

  -- تسجيل في السجل
  INSERT INTO auto_journal_log (
    template_id, trigger_event, reference_type, reference_id,
    amount, journal_entry_id, success, metadata
  ) VALUES (
    v_template.id, p_trigger_event, p_reference_type, p_reference_id,
    p_amount, v_entry_id, true, p_metadata
  );

  RETURN v_entry_id;
END;
$$;
```

### 2. Trigger لترحيل القيد

```sql
CREATE FUNCTION post_journal_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.posted = true AND OLD.posted = false THEN
    -- تحديث أرصدة الحسابات
    UPDATE accounts a
    SET current_balance = current_balance + 
      CASE 
        WHEN a.account_nature = 'debit' THEN 
          (SELECT SUM(debit_amount - credit_amount) 
           FROM journal_entry_lines 
           WHERE journal_entry_id = NEW.id AND account_id = a.id)
        WHEN a.account_nature = 'credit' THEN 
          (SELECT SUM(credit_amount - debit_amount) 
           FROM journal_entry_lines 
           WHERE journal_entry_id = NEW.id AND account_id = a.id)
      END,
      updated_at = now()
    WHERE id IN (
      SELECT DISTINCT account_id 
      FROM journal_entry_lines 
      WHERE journal_entry_id = NEW.id
    );

    NEW.posted_at := now();
    NEW.status := 'posted';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER post_journal_entry_trigger
BEFORE UPDATE OF posted ON journal_entries
FOR EACH ROW
WHEN (NEW.posted = true AND OLD.posted = false)
EXECUTE FUNCTION post_journal_entry();
```

---

## 📊 Views للتقارير

### 1. دفتر الأستاذ العام (General Ledger)

```sql
CREATE VIEW general_ledger AS
SELECT 
  a.code AS account_code,
  a.name_ar AS account_name,
  je.entry_number,
  je.entry_date,
  je.description AS entry_description,
  jel.description AS line_description,
  jel.debit_amount,
  jel.credit_amount,
  SUM(jel.debit_amount - jel.credit_amount) 
    OVER (PARTITION BY a.id ORDER BY je.entry_date, je.entry_number) AS running_balance,
  je.status,
  je.posted
FROM journal_entry_lines jel
JOIN journal_entries je ON jel.journal_entry_id = je.id
JOIN accounts a ON jel.account_id = a.id
WHERE je.posted = true
ORDER BY a.code, je.entry_date, je.entry_number;
```

### 2. ميزان المراجعة (Trial Balance)

```sql
CREATE VIEW trial_balance AS
SELECT 
  a.code,
  a.name_ar,
  a.account_type,
  SUM(jel.debit_amount) AS total_debit,
  SUM(jel.credit_amount) AS total_credit,
  SUM(jel.debit_amount - jel.credit_amount) AS balance
FROM accounts a
LEFT JOIN journal_entry_lines jel ON a.id = jel.account_id
LEFT JOIN journal_entries je ON jel.journal_entry_id = je.id
WHERE je.posted = true OR je.id IS NULL
GROUP BY a.id, a.code, a.name_ar, a.account_type
ORDER BY a.code;
```

---

## 🎨 مكونات Frontend

### المكونات المطلوبة

1. **ChartOfAccounts.tsx**
   - عرض شجرة الحسابات
   - إضافة/تعديل حسابات
   - drag & drop لإعادة الترتيب

2. **JournalEntryForm.tsx**
   - إنشاء قيد يدوي
   - إضافة سطور متعددة
   - التحقق من التوازن

3. **GeneralLedger.tsx**
   - عرض دفتر الأستاذ
   - تصفية حسب الحساب والتاريخ
   - تصدير PDF/Excel

4. **TrialBalance.tsx**
   - عرض ميزان المراجعة
   - مقارنة فترات
   - طباعة

5. **BankReconciliation.tsx**
   - عرض المعاملات غير المطابقة
   - مطابقة تلقائية
   - مطابقة يدوية

6. **FinancialReports.tsx**
   - قائمة المركز المالي (Balance Sheet)
   - قائمة الدخل (P&L)
   - قائمة التدفقات النقدية

---

## 🚀 خطوات التنفيذ

### المرحلة 15.1: الأساسيات
1. ✅ إنشاء جداول الحسابات
2. ✅ إنشاء جداول القيود
3. ✅ Views للتقارير الأساسية
4. ✅ RLS Policies

### المرحلة 15.2: القيود التلقائية
1. ✅ جداول القوالب
2. ✅ دالة إنشاء قيد تلقائي
3. ✅ Triggers للأحداث
4. ✅ سجل التنفيذ

### المرحلة 15.3: البنوك والتسوية
1. ✅ جداول البنوك
2. ✅ المطابقة التلقائية
3. ✅ واجهة التسوية
4. ✅ التقارير البنكية

### المرحلة 15.4: التقارير المالية
1. ✅ مكونات التقارير
2. ✅ واجهات الطباعة
3. ✅ التصدير بصيغ متعددة
4. ✅ المقارنات والتحليلات

---

## ✅ معايير الإكمال

- [ ] شجرة حسابات من 5 مستويات تعمل
- [ ] قيود يومية مع approval workflow
- [ ] قيود تلقائية لجميع العمليات
- [ ] دفتر أستاذ دقيق
- [ ] ميزان مراجعة متوازن
- [ ] تسوية بنكية تعمل
- [ ] 6+ تقارير مالية شاملة
- [ ] اختبارات شاملة
- [ ] توثيق كامل

---

## 📈 KPIs للنجاح

- ⚡ زمن إنشاء قيد < 2 ثانية
- 🎯 دقة المطابقة البنكية > 95%
- 📊 توليد التقارير < 5 ثوانٍ
- ✅ نسبة القيود التلقائية > 80%
- 🔒 امتثال ZATCA 100%
