-- Fix: chatbot_conversations unrestricted delete
-- Implement soft delete instead of hard delete

-- 1. Add soft delete columns if not exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'chatbot_conversations' 
                 AND column_name = 'deleted_at') THEN
    ALTER TABLE public.chatbot_conversations 
      ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL,
      ADD COLUMN deleted_by UUID REFERENCES auth.users(id) DEFAULT NULL,
      ADD COLUMN deletion_reason TEXT DEFAULT NULL;
  END IF;
END $$;

-- 2. Drop the old delete policy
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.chatbot_conversations;

-- 3. Create new policy for soft delete (UPDATE with deleted_at)
DROP POLICY IF EXISTS "Users can soft delete own conversations" ON public.chatbot_conversations;
CREATE POLICY "Users can soft delete own conversations"
  ON public.chatbot_conversations
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (
    user_id = auth.uid() 
    AND deleted_at IS NOT NULL 
    AND deleted_by = auth.uid()
  );

-- 4. Block all hard deletes
DROP POLICY IF EXISTS "No hard deletes allowed" ON public.chatbot_conversations;
CREATE POLICY "No hard deletes allowed"
  ON public.chatbot_conversations
  FOR DELETE
  USING (false);

-- 5. Update SELECT to exclude soft-deleted records for regular users
DROP POLICY IF EXISTS "Users can view own conversations" ON public.chatbot_conversations;
DROP POLICY IF EXISTS "Users can view own non-deleted conversations" ON public.chatbot_conversations;

CREATE POLICY "Users can view own non-deleted conversations"
  ON public.chatbot_conversations
  FOR SELECT
  USING (
    user_id = auth.uid() 
    AND deleted_at IS NULL
  );

-- 6. Admins can view all including deleted (for audit purposes)
DROP POLICY IF EXISTS "Admins can view all conversations" ON public.chatbot_conversations;
CREATE POLICY "Admins can view all conversations"
  ON public.chatbot_conversations
  FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'nazer'::public.app_role)
  );