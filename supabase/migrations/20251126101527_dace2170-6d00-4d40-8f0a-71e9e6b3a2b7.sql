-- Create unified project documentation system

-- Main documentation table
CREATE TABLE IF NOT EXISTS project_documentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('core', 'design', 'testing', 'future')),
  phase_number INTEGER NOT NULL,
  phase_name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('completed', 'in_progress', 'planned', 'blocked')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  start_date TIMESTAMP,
  completion_date TIMESTAMP,
  tasks JSONB DEFAULT '[]'::jsonb,
  deliverables JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Documentation changelog table
CREATE TABLE IF NOT EXISTS documentation_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doc_id UUID REFERENCES project_documentation(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES profiles(id),
  changed_by_name TEXT,
  change_type TEXT NOT NULL CHECK (change_type IN ('status_change', 'task_completed', 'note_added', 'phase_created', 'phase_updated')),
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE project_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation_changelog ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_documentation using current_user_roles view
CREATE POLICY "Allow nazer and admin to view documentation"
  ON project_documentation FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM current_user_roles
      WHERE current_user_roles.user_id = auth.uid()
      AND current_user_roles.role IN ('nazer', 'admin')
    )
  );

CREATE POLICY "Allow nazer and admin to insert documentation"
  ON project_documentation FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM current_user_roles
      WHERE current_user_roles.user_id = auth.uid()
      AND current_user_roles.role IN ('nazer', 'admin')
    )
  );

CREATE POLICY "Allow nazer and admin to update documentation"
  ON project_documentation FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM current_user_roles
      WHERE current_user_roles.user_id = auth.uid()
      AND current_user_roles.role IN ('nazer', 'admin')
    )
  );

-- RLS Policies for documentation_changelog
CREATE POLICY "Allow nazer and admin to view changelog"
  ON documentation_changelog FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM current_user_roles
      WHERE current_user_roles.user_id = auth.uid()
      AND current_user_roles.role IN ('nazer', 'admin')
    )
  );

CREATE POLICY "Allow nazer and admin to insert changelog"
  ON documentation_changelog FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM current_user_roles
      WHERE current_user_roles.user_id = auth.uid()
      AND current_user_roles.role IN ('nazer', 'admin')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_project_documentation_category ON project_documentation(category);
CREATE INDEX idx_project_documentation_status ON project_documentation(status);
CREATE INDEX idx_project_documentation_phase_number ON project_documentation(phase_number);
CREATE INDEX idx_documentation_changelog_doc_id ON documentation_changelog(doc_id);
CREATE INDEX idx_documentation_changelog_created_at ON documentation_changelog(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_documentation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-updating updated_at
CREATE TRIGGER trigger_update_documentation_timestamp
  BEFORE UPDATE ON project_documentation
  FOR EACH ROW
  EXECUTE FUNCTION update_documentation_updated_at();

-- Function to log documentation changes
CREATE OR REPLACE FUNCTION log_documentation_change()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Get user name from profiles
  SELECT full_name INTO user_name
  FROM profiles
  WHERE id = auth.uid();

  -- Log the change
  IF TG_OP = 'UPDATE' THEN
    -- Check if status changed
    IF OLD.status != NEW.status THEN
      INSERT INTO documentation_changelog (doc_id, changed_by, changed_by_name, change_type, old_value, new_value)
      VALUES (NEW.id, auth.uid(), user_name, 'status_change', OLD.status, NEW.status);
    END IF;
    
    -- Check if notes changed
    IF OLD.notes IS DISTINCT FROM NEW.notes THEN
      INSERT INTO documentation_changelog (doc_id, changed_by, changed_by_name, change_type, new_value)
      VALUES (NEW.id, auth.uid(), user_name, 'note_added', NEW.notes);
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO documentation_changelog (doc_id, changed_by, changed_by_name, change_type, new_value)
    VALUES (NEW.id, auth.uid(), user_name, 'phase_created', NEW.phase_name);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for logging changes
CREATE TRIGGER trigger_log_documentation_changes
  AFTER INSERT OR UPDATE ON project_documentation
  FOR EACH ROW
  EXECUTE FUNCTION log_documentation_change();

COMMENT ON TABLE project_documentation IS 'Unified project documentation and phase tracking system';
COMMENT ON TABLE documentation_changelog IS 'Audit log for all documentation changes';