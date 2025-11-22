-- Add 'تحت التحصيل' to the rental_payments status check constraint
ALTER TABLE rental_payments DROP CONSTRAINT IF EXISTS rental_payments_status_check;

ALTER TABLE rental_payments 
ADD CONSTRAINT rental_payments_status_check 
CHECK (status IN ('معلق', 'مدفوع', 'متأخر', 'مدفوع جزئياً', 'تحت التحصيل'));