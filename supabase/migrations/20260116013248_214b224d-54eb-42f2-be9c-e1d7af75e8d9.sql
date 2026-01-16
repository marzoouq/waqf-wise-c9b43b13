-- إضافة قالب القيد التلقائي لسند القبض
INSERT INTO auto_journal_templates (
  trigger_event,
  template_name,
  description,
  debit_accounts,
  credit_accounts,
  is_active,
  priority
) VALUES (
  'payment_receipt',
  'استلام سند قبض',
  'قيد تلقائي عند إنشاء سند قبض (تحصيل)',
  '[{"account_code": "1101", "percentage": 100}]'::jsonb,
  '[{"account_code": "4101", "percentage": 100}]'::jsonb,
  true,
  100
);

-- إضافة قالب لسند الصرف إذا لم يكن موجوداً
INSERT INTO auto_journal_templates (
  trigger_event,
  template_name,
  description,
  debit_accounts,
  credit_accounts,
  is_active,
  priority
) VALUES (
  'payment_voucher',
  'صرف سند صرف',
  'قيد تلقائي عند إنشاء سند صرف',
  '[{"account_code": "5101", "percentage": 100}]'::jsonb,
  '[{"account_code": "1101", "percentage": 100}]'::jsonb,
  true,
  100
) ON CONFLICT DO NOTHING;