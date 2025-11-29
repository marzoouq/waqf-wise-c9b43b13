-- إصلاح Function Search Path
CREATE OR REPLACE FUNCTION update_landing_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;