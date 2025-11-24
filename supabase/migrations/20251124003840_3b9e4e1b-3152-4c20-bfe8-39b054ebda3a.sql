-- إصلاح التحذير الأمني
ALTER FUNCTION process_existing_rental_payments() SET search_path = public, pg_temp;