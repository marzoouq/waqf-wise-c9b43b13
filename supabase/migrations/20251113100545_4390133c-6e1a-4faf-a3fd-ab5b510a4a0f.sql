-- إنشاء جدول تعليقات الطلبات
CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES beneficiary_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_request_comments_request ON request_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_request_comments_user ON request_comments(user_id);

-- RLS Policies
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'request_comments' 
    AND policyname = 'Authenticated users can view comments'
  ) THEN
    CREATE POLICY "Authenticated users can view comments"
    ON request_comments FOR SELECT
    TO authenticated
    USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'request_comments' 
    AND policyname = 'Authenticated users can insert comments'
  ) THEN
    CREATE POLICY "Authenticated users can insert comments"
    ON request_comments FOR INSERT
    TO authenticated
    WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'request_comments' 
    AND policyname = 'Users can update their own comments'
  ) THEN
    CREATE POLICY "Users can update their own comments"
    ON request_comments FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'request_comments' 
    AND policyname = 'Admins can delete comments'
  ) THEN
    CREATE POLICY "Admins can delete comments"
    ON request_comments FOR DELETE
    TO authenticated
    USING (has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- Function للتحقق من الطلبات المتأخرة وتحديثها
CREATE OR REPLACE FUNCTION check_overdue_requests()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE beneficiary_requests br
  SET is_overdue = true,
      updated_at = now()
  WHERE br.status IN ('قيد المراجعة', 'قيد المعالجة')
    AND br.is_overdue = false
    AND br.sla_due_at IS NOT NULL
    AND br.sla_due_at < now();
END;
$$;