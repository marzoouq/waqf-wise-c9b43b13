-- إصلاح سياسات الجداول المتبقية

-- 1. landing_page_settings - تقييد للموظفين والورثة فقط
DROP POLICY IF EXISTS "public_read_landing_settings" ON landing_page_settings;
DROP POLICY IF EXISTS "Landing page settings are public" ON landing_page_settings;
DROP POLICY IF EXISTS "Anyone can read landing page settings" ON landing_page_settings;

CREATE POLICY "staff_or_heir_view_landing_settings" ON landing_page_settings
FOR SELECT TO authenticated
USING (public.is_staff() OR public.is_heir());

-- 2. request_types - تقييد للمستخدمين المصادق عليهم فقط
DROP POLICY IF EXISTS "public_read_request_types" ON request_types;
DROP POLICY IF EXISTS "Request types are public" ON request_types;
DROP POLICY IF EXISTS "Anyone can read request types" ON request_types;
DROP POLICY IF EXISTS "authenticated_read_request_types" ON request_types;

CREATE POLICY "authenticated_view_request_types" ON request_types
FOR SELECT TO authenticated
USING (true);