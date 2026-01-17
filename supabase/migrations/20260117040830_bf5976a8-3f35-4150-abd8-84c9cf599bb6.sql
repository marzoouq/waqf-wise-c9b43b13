-- ============================================
-- إصلاح المشاكل الأمنية المتبقية
-- ============================================

-- 1. إصلاح request_types - تقييد الوصول للمستخدمين المصادق عليهم فقط
DROP POLICY IF EXISTS "request_types_select_policy" ON request_types;

-- إنشاء سياسة تسمح فقط للمستخدمين المصادق عليهم بقراءة أنواع الطلبات النشطة
CREATE POLICY "authenticated_can_view_active_request_types"
ON request_types FOR SELECT
TO authenticated
USING (is_active = true);

-- 2. إصلاح tribes - تقييد الوصول للمستخدمين المصادق عليهم
DROP POLICY IF EXISTS "القبائل متاحة للجميع للقراءة" ON tribes;

CREATE POLICY "authenticated_can_view_tribes"
ON tribes FOR SELECT
TO authenticated
USING (true);