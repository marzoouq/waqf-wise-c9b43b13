-- إضافة عمود is_historical إلى journal_entries
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS is_historical BOOLEAN DEFAULT false;