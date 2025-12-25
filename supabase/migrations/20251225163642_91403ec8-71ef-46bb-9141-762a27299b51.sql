-- إنشاء جدول auto_fix_attempts لتسجيل محاولات الإصلاح التلقائي
CREATE TABLE IF NOT EXISTS public.auto_fix_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_id UUID REFERENCES public.system_error_logs(id) ON DELETE SET NULL,
  fix_strategy TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  result TEXT,
  error_message TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إضافة RLS
ALTER TABLE public.auto_fix_attempts ENABLE ROW LEVEL SECURITY;

-- سياسة للسماح للمسؤولين فقط
CREATE POLICY "Admins can manage auto_fix_attempts" ON public.auto_fix_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'nazer')
    )
  );

-- إنشاء دالة لجلب تغطية RLS
CREATE OR REPLACE FUNCTION public.get_rls_coverage()
RETURNS JSON
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT json_build_object(
    'total_tables', (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'),
    'rls_enabled', (SELECT COUNT(*) FROM pg_tables pt 
                    JOIN pg_class pc ON pc.relname = pt.tablename 
                    WHERE pt.schemaname = 'public' AND pc.relrowsecurity = true),
    'coverage', CASE 
      WHEN (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public') = 0 THEN 0
      ELSE ROUND(100.0 * (SELECT COUNT(*) FROM pg_tables pt 
                          JOIN pg_class pc ON pc.relname = pt.tablename 
                          WHERE pt.schemaname = 'public' AND pc.relrowsecurity = true) / 
                (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'))
    END
  );
$$;

-- منح صلاحيات تنفيذ الدالة
GRANT EXECUTE ON FUNCTION public.get_rls_coverage() TO authenticated;

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_auto_fix_attempts_status ON public.auto_fix_attempts(status);
CREATE INDEX IF NOT EXISTS idx_auto_fix_attempts_created_at ON public.auto_fix_attempts(created_at DESC);