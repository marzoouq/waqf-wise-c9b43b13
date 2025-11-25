-- إصلاح Function update_next_maintenance_date لإضافة ELSE clause
CREATE OR REPLACE FUNCTION update_next_maintenance_date()
RETURNS TRIGGER AS $$
BEGIN
  NEW.next_maintenance_date := NEW.last_maintenance_date + 
    CASE NEW.frequency
      WHEN 'daily' THEN (NEW.frequency_value || ' days')::interval
      WHEN 'weekly' THEN (NEW.frequency_value * 7 || ' days')::interval
      WHEN 'monthly' THEN (NEW.frequency_value || ' months')::interval
      WHEN 'quarterly' THEN (NEW.frequency_value * 3 || ' months')::interval
      WHEN 'biannual' THEN (NEW.frequency_value * 6 || ' months')::interval
      WHEN 'yearly' THEN (NEW.frequency_value || ' years')::interval
      ELSE (NEW.frequency_value || ' days')::interval  -- إضافة ELSE للحالات الأخرى
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;