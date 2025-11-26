-- Fix security warnings for documentation functions

-- Drop and recreate update function with proper search_path
DROP FUNCTION IF EXISTS update_documentation_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION update_documentation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public, pg_temp;

-- Drop and recreate log function with proper search_path
DROP FUNCTION IF EXISTS log_documentation_change() CASCADE;
CREATE OR REPLACE FUNCTION log_documentation_change()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Get user name from profiles
  SELECT full_name INTO user_name
  FROM public.profiles
  WHERE id = auth.uid();

  -- Log the change
  IF TG_OP = 'UPDATE' THEN
    -- Check if status changed
    IF OLD.status != NEW.status THEN
      INSERT INTO public.documentation_changelog (doc_id, changed_by, changed_by_name, change_type, old_value, new_value)
      VALUES (NEW.id, auth.uid(), user_name, 'status_change', OLD.status, NEW.status);
    END IF;
    
    -- Check if notes changed
    IF OLD.notes IS DISTINCT FROM NEW.notes THEN
      INSERT INTO public.documentation_changelog (doc_id, changed_by, changed_by_name, change_type, new_value)
      VALUES (NEW.id, auth.uid(), user_name, 'note_added', NEW.notes);
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.documentation_changelog (doc_id, changed_by, changed_by_name, change_type, new_value)
    VALUES (NEW.id, auth.uid(), user_name, 'phase_created', NEW.phase_name);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- Recreate triggers
CREATE TRIGGER trigger_update_documentation_timestamp
  BEFORE UPDATE ON project_documentation
  FOR EACH ROW
  EXECUTE FUNCTION update_documentation_updated_at();

CREATE TRIGGER trigger_log_documentation_changes
  AFTER INSERT OR UPDATE ON project_documentation
  FOR EACH ROW
  EXECUTE FUNCTION log_documentation_change();