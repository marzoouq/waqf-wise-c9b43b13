-- Create sequence for payments table
CREATE SEQUENCE IF NOT EXISTS payments_seq START 1;

-- Create function for auto payment number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_number IS NULL OR NEW.payment_number = '' THEN
    NEW.payment_number := 'PAY-' || LPAD(nextval('payments_seq')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS auto_payment_number ON payments;
CREATE TRIGGER auto_payment_number
  BEFORE INSERT ON payments
  FOR EACH ROW
  EXECUTE FUNCTION generate_payment_number();

-- Make payment_number nullable or set default
ALTER TABLE payments ALTER COLUMN payment_number DROP NOT NULL;