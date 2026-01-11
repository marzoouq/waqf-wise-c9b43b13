-- حذف سطور القيود
DELETE FROM journal_entry_lines WHERE journal_entry_id IN (
  '4fb2219b-9b37-4477-b54d-554e8ada6de2',
  '0cea27d6-0e67-41bf-8b9f-e7509c8dc21b',
  '5d5ced6d-c934-4898-98f1-e70f4af81d29',
  'daf4ddc7-d023-43d8-ac58-af1a0ce850a0'
);

-- حذف القيود اليومية
DELETE FROM journal_entries WHERE id IN (
  '4fb2219b-9b37-4477-b54d-554e8ada6de2',
  '0cea27d6-0e67-41bf-8b9f-e7509c8dc21b',
  '5d5ced6d-c934-4898-98f1-e70f4af81d29',
  'daf4ddc7-d023-43d8-ac58-af1a0ce850a0'
);

-- تصفير أرصدة الحسابات
UPDATE accounts SET current_balance = 0;

-- إعادة تفعيل trigger
ALTER TABLE journal_entry_lines ENABLE TRIGGER update_account_balance_trigger