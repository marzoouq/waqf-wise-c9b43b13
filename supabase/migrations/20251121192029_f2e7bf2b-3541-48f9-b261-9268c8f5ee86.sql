-- إصلاح تحذيرات Function Search Path

ALTER FUNCTION public.update_property_units_count() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_decision_voting_results() SET search_path = public, pg_temp;