
-- إصلاح جميع الـ views لتكون SECURITY INVOKER بدلاً من SECURITY DEFINER

-- 1. beneficiary_account_statement
ALTER VIEW beneficiary_account_statement SET (security_invoker = true);

-- 2. beneficiary_statistics
ALTER VIEW beneficiary_statistics SET (security_invoker = true);

-- 3. current_user_roles (تم إصلاحه بالفعل)
-- تم بالفعل في الـ migration السابقة

-- 4. distribution_statistics
ALTER VIEW distribution_statistics SET (security_invoker = true);

-- 5. messages_with_users
ALTER VIEW messages_with_users SET (security_invoker = true);

-- 6. payment_vouchers_with_details
ALTER VIEW payment_vouchers_with_details SET (security_invoker = true);

-- 7. payments_with_contract_details
ALTER VIEW payments_with_contract_details SET (security_invoker = true);

-- 8. recent_activities
ALTER VIEW recent_activities SET (security_invoker = true);

-- 9. unified_transactions_view
ALTER VIEW unified_transactions_view SET (security_invoker = true);

-- 10. users_with_roles
ALTER VIEW users_with_roles SET (security_invoker = true);

-- إضافة تعليقات توضيحية
COMMENT ON VIEW beneficiary_account_statement IS 'Security Invoker - Beneficiary account statements';
COMMENT ON VIEW beneficiary_statistics IS 'Security Invoker - Beneficiary statistics';
COMMENT ON VIEW distribution_statistics IS 'Security Invoker - Distribution statistics';
COMMENT ON VIEW messages_with_users IS 'Security Invoker - Messages with user details';
COMMENT ON VIEW payment_vouchers_with_details IS 'Security Invoker - Payment vouchers with details';
COMMENT ON VIEW payments_with_contract_details IS 'Security Invoker - Payments with contract details';
COMMENT ON VIEW recent_activities IS 'Security Invoker - Recent activities log';
COMMENT ON VIEW unified_transactions_view IS 'Security Invoker - Unified transactions view';
COMMENT ON VIEW users_with_roles IS 'Security Invoker - Users with their roles';
