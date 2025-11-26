-- تحويل جميع الـ Views إلى SECURITY INVOKER بشكل صحيح
-- استخدام ALTER VIEW بدلاً من CREATE VIEW

-- 1. تحويل beneficiary_account_statement
ALTER VIEW public.beneficiary_account_statement SET (security_invoker = true);

-- 2. تحويل beneficiary_statistics
ALTER VIEW public.beneficiary_statistics SET (security_invoker = true);

-- 3. تحويل distribution_statistics
ALTER VIEW public.distribution_statistics SET (security_invoker = true);

-- 4. تحويل payment_vouchers_with_details
ALTER VIEW public.payment_vouchers_with_details SET (security_invoker = true);

-- 5. تحويل current_user_roles
ALTER VIEW public.current_user_roles SET (security_invoker = true);

-- 6. تحويل general_ledger
ALTER VIEW public.general_ledger SET (security_invoker = true);

-- 7. تحويل messages_with_users
ALTER VIEW public.messages_with_users SET (security_invoker = true);

-- 8. تحويل payments_with_contract_details
ALTER VIEW public.payments_with_contract_details SET (security_invoker = true);

-- 9. تحويل recent_activities
ALTER VIEW public.recent_activities SET (security_invoker = true);

-- 10. تحويل safe_active_sessions
ALTER VIEW public.safe_active_sessions SET (security_invoker = true);

-- 11. تحويل trial_balance
ALTER VIEW public.trial_balance SET (security_invoker = true);

-- 12. تحويل unified_transactions_view
ALTER VIEW public.unified_transactions_view SET (security_invoker = true);

-- 13. تحويل user_profile_with_roles
ALTER VIEW public.user_profile_with_roles SET (security_invoker = true);

-- إضافة تعليقات توضيحية
COMMENT ON VIEW public.beneficiary_account_statement IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.beneficiary_statistics IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.distribution_statistics IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.payment_vouchers_with_details IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.current_user_roles IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.general_ledger IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.messages_with_users IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.payments_with_contract_details IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.recent_activities IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.safe_active_sessions IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.trial_balance IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.unified_transactions_view IS 'SECURITY INVOKER: Uses querying user RLS policies';
COMMENT ON VIEW public.user_profile_with_roles IS 'SECURITY INVOKER: Uses querying user RLS policies';