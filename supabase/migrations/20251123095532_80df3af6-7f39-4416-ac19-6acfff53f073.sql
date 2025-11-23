-- إصلاح تحذيرات الأمان: إضافة RLS policies للـ view
-- تطبيق نفس السياسات التي على جدول payments

-- حذف الـ view الحالي وإعادة إنشائه بدون SECURITY DEFINER
DROP VIEW IF EXISTS payments_with_contract_details;

CREATE VIEW payments_with_contract_details 
WITH (security_invoker = true)
AS
SELECT 
  p.*,
  c.contract_number,
  c.tenant_name,
  c.tenant_phone,
  c.tenant_id_number,
  prop.name as property_name,
  prop.location as property_location,
  prop.type as property_type
FROM payments p
LEFT JOIN contracts c ON p.contract_id = c.id
LEFT JOIN properties prop ON c.property_id = prop.id;

-- منح الصلاحيات المناسبة
GRANT SELECT ON payments_with_contract_details TO authenticated;

-- إضافة comment للتوضيح
COMMENT ON VIEW payments_with_contract_details IS 'عرض السندات مع تفاصيل العقود والعقارات - تستخدم security_invoker لتطبيق RLS من الجداول الأصلية';