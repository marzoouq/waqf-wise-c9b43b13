-- جدول لحفظ نتائج الاختبارات التاريخية
CREATE TABLE public.test_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_tests INTEGER NOT NULL DEFAULT 0,
  passed_tests INTEGER NOT NULL DEFAULT 0,
  failed_tests INTEGER NOT NULL DEFAULT 0,
  pass_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  avg_duration INTEGER NOT NULL DEFAULT 0,
  categories_summary JSONB DEFAULT '{}',
  failed_tests_details JSONB DEFAULT '[]',
  triggered_by VARCHAR(100) DEFAULT 'manual',
  run_duration_seconds INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;

-- سياسات الوصول - السماح للجميع بالقراءة والإدراج (لأغراض الاختبار)
CREATE POLICY "Anyone can read test runs"
ON public.test_runs
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert test runs"
ON public.test_runs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own test runs"
ON public.test_runs
FOR DELETE
USING (auth.uid() = created_by);

-- فهرس للتاريخ لتسريع الاستعلامات
CREATE INDEX idx_test_runs_run_date ON public.test_runs(run_date DESC);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.test_runs;