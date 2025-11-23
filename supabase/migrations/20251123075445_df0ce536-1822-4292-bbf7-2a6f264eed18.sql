-- ============================================
-- إصلاح جميع Security Definer Views المتبقية
-- ============================================

-- إصلاح Views الإضافية التي لم يتم تحديثها
ALTER VIEW IF EXISTS current_user_roles SET (security_invoker = true);
ALTER VIEW IF EXISTS recent_activities SET (security_invoker = true);
ALTER VIEW IF EXISTS unified_transactions_view SET (security_invoker = true);

-- إضافة تعليق للتوثيق
COMMENT ON VIEW current_user_roles IS 'أدوار المستخدم الحالي - SECURITY INVOKER';
COMMENT ON VIEW recent_activities IS 'النشاطات الأخيرة - SECURITY INVOKER';
COMMENT ON VIEW unified_transactions_view IS 'عرض المعاملات الموحد - SECURITY INVOKER';