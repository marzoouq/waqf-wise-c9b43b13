
-- إصلاح الدوال الـ7 المتبقية
ALTER FUNCTION public.create_user_profile_and_role(uuid, text, text, app_role) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.seed_demo_data() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.seed_journal_entries() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_contract_status() SET search_path TO 'public', 'pg_temp';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public', 'pg_temp';
