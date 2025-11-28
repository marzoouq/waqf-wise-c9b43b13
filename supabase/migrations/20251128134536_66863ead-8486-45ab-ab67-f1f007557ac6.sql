-- إضافة توزيعات ربع سنوية
INSERT INTO distributions (id, month, distribution_date, total_amount, beneficiaries_count, status, notes, distribution_type, period_start, period_end, nazer_percentage, charity_percentage, corpus_percentage)
VALUES 
  ('d1000000-0000-0000-0000-000000000001', 'الربع الأول 2024', '2024-03-31', 140000, 14, 'مكتمل', 'توزيع غلة الوقف للربع الأول', 'ربع_سنوي', '2024-01-01', '2024-03-31', 5, 5, 10),
  ('d2000000-0000-0000-0000-000000000002', 'الربع الثاني 2024', '2024-06-30', 150000, 14, 'مكتمل', 'توزيع غلة الوقف للربع الثاني', 'ربع_سنوي', '2024-04-01', '2024-06-30', 5, 5, 10),
  ('d3000000-0000-0000-0000-000000000003', 'الربع الثالث 2024', '2024-09-30', 145000, 14, 'مكتمل', 'توزيع غلة الوقف للربع الثالث', 'ربع_سنوي', '2024-07-01', '2024-09-30', 5, 5, 10),
  ('d4000000-0000-0000-0000-000000000004', 'الربع الرابع 2024', '2024-12-31', 155000, 14, 'معلق', 'توزيع غلة الوقف للربع الرابع', 'ربع_سنوي', '2024-10-01', '2024-12-31', 5, 5, 10);

-- إضافة تفاصيل التوزيعات لكل مستفيد
INSERT INTO distribution_details (distribution_id, beneficiary_id, allocated_amount, payment_status, payment_date)
SELECT 'd1000000-0000-0000-0000-000000000001', id, 10000, 'مدفوع', '2024-03-31' FROM beneficiaries;

INSERT INTO distribution_details (distribution_id, beneficiary_id, allocated_amount, payment_status, payment_date)
SELECT 'd2000000-0000-0000-0000-000000000002', id, 10714.29, 'مدفوع', '2024-06-30' FROM beneficiaries;

INSERT INTO distribution_details (distribution_id, beneficiary_id, allocated_amount, payment_status, payment_date)
SELECT 'd3000000-0000-0000-0000-000000000003', id, 10357.14, 'مدفوع', '2024-09-30' FROM beneficiaries;

-- إضافة قيود يومية مرحّلة
INSERT INTO journal_entries (id, entry_number, entry_date, fiscal_year_id, description, status, posted, entry_type)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'JE-2024-001', '2024-01-15', 'b07ab9e6-6770-4260-9e95-5897cf741af9', 'إيراد إيجارات شهر يناير', 'posted', true, 'manual'),
  ('22222222-2222-2222-2222-222222222222', 'JE-2024-002', '2024-02-15', 'b07ab9e6-6770-4260-9e95-5897cf741af9', 'إيراد إيجارات شهر فبراير', 'posted', true, 'manual'),
  ('33333333-3333-3333-3333-333333333333', 'JE-2024-003', '2024-03-15', 'b07ab9e6-6770-4260-9e95-5897cf741af9', 'إيراد إيجارات شهر مارس', 'posted', true, 'manual'),
  ('44444444-4444-4444-4444-444444444444', 'JE-2024-004', '2024-03-31', 'b07ab9e6-6770-4260-9e95-5897cf741af9', 'صرف توزيعات الربع الأول', 'posted', true, 'auto'),
  ('55555555-5555-5555-5555-555555555555', 'JE-2024-005', '2024-04-15', 'b07ab9e6-6770-4260-9e95-5897cf741af9', 'إيراد إيجارات شهر أبريل', 'posted', true, 'manual');

-- تحديث أرصدة المستفيدين
UPDATE beneficiaries
SET total_received = 31071.43, account_balance = 5000, total_payments = 3
WHERE family_name LIKE '%الثبيتي%' OR full_name LIKE '%الثبيتي%';