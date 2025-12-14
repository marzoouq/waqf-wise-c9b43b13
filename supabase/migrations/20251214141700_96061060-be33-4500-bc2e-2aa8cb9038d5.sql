-- إصلاح تحذير SECURITY DEFINER View بإضافة security_invoker
ALTER VIEW public.user_profile_with_roles SET (security_invoker = true);