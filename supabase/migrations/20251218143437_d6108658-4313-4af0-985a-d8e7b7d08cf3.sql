
-- إنشاء دالة VACUUM ANALYZE للجداول
CREATE OR REPLACE FUNCTION public.run_vacuum_analyze()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb := '[]'::jsonb;
BEGIN
  ANALYZE user_roles;
  ANALYZE beneficiaries;
  ANALYZE profiles;
  ANALYZE journal_entry_lines;
  ANALYZE journal_entries;
  ANALYZE payments;
  ANALYZE contracts;
  ANALYZE properties;
  ANALYZE distributions;
  ANALYZE loans;
  ANALYZE notifications;
  ANALYZE audit_logs;
  ANALYZE accounts;
  ANALYZE rental_payments;
  
  v_result := jsonb_build_object(
    'success', true,
    'tables_analyzed', 14,
    'timestamp', now()
  );
  
  RETURN v_result;
END;
$$;

-- إنشاء دالة لإعادة تعيين الإحصائيات
CREATE OR REPLACE FUNCTION public.reset_performance_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM pg_stat_reset();
  
  RETURN jsonb_build_object(
    'success', true,
    'message', 'تم إعادة تعيين إحصائيات الأداء',
    'timestamp', now()
  );
END;
$$;
