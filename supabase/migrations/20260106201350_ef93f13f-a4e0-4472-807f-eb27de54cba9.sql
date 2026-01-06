-- حذف القيد المكرر للعلاقة بين journal_entry_lines و accounts
ALTER TABLE public.journal_entry_lines 
DROP CONSTRAINT IF EXISTS fk_jel_account;

-- حذف القيد المكرر للعلاقة بين journal_entry_lines و journal_entries
ALTER TABLE public.journal_entry_lines 
DROP CONSTRAINT IF EXISTS fk_jel_journal_entry;