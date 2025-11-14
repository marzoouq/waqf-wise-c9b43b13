-- إضافة الحقول المفقودة لجدول saved_searches
ALTER TABLE saved_searches 
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS search_type TEXT DEFAULT 'beneficiary';

-- Create policy if not exists  
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'saved_searches' 
    AND policyname = 'Users can view shared searches'
  ) THEN
    CREATE POLICY "Users can view shared searches"
      ON saved_searches
      FOR SELECT
      USING (is_shared = true OR auth.uid() = user_id);
  END IF;
END$$;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_saved_searches_search_type ON saved_searches(search_type);

COMMENT ON COLUMN saved_searches.is_shared IS 'هل البحث مشترك مع الآخرين';
COMMENT ON COLUMN saved_searches.search_type IS 'نوع البحث (beneficiary, family, etc)';