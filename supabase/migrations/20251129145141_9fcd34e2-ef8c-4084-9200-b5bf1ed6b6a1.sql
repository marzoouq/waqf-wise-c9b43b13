
-- إنشاء sequence للقيود إذا لم يكن موجوداً
CREATE SEQUENCE IF NOT EXISTS journal_entry_number_seq START 1000;

-- تعطيل trigger auto_create_journal_entry_for_payment مؤقتاً لـ rental_payments
DROP TRIGGER IF EXISTS trigger_auto_create_journal_entry_for_payment ON rental_payments;
