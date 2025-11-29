-- ==========================================================
-- Migration: تحسين سياسات الأمان RLS
-- Date: 2025-11-29
-- ==========================================================

-- 1. تحسين سياسات contact_messages
-- إزالة السياسة القديمة التي تسمح لجميع المستخدمين المصادقين بالقراءة
DROP POLICY IF EXISTS "Authenticated users can view contact messages" ON contact_messages;

-- إنشاء سياسة جديدة تقيد القراءة للإداريين فقط
CREATE POLICY "Only admins and nazer can view contact messages"
  ON contact_messages
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nazer'::app_role)
  );

-- 2. تحسين سياسات contracts
-- إزالة السياسة التي تسمح للمستفيدين بقراءة جميع العقود
DROP POLICY IF EXISTS "المستفيدون يمكنهم قراءة جميع العق" ON contracts;

-- المستفيدون يمكنهم رؤية العقود الخاصة بعقاراتهم فقط (إن وُجد ربط)
-- لكن نُبقي على سياسات الموظفين الموجودة

-- 3. تحسين سياسات rental_payments
-- إضافة سياسة أكثر تقييداً
DROP POLICY IF EXISTS "rental_payments_view_policy" ON rental_payments;

CREATE POLICY "staff_can_view_all_rental_payments"
  ON rental_payments
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nazer'::app_role) OR
    has_role(auth.uid(), 'accountant'::app_role) OR
    has_role(auth.uid(), 'cashier'::app_role)
  );

-- 4. تحسين سياسات invoices
-- تقييد المستفيدين لرؤية فواتيرهم فقط
DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_invoices" ON invoices;

CREATE POLICY "staff_and_own_invoices_policy"
  ON invoices
  FOR SELECT
  USING (
    -- الموظفون يمكنهم رؤية جميع الفواتير
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nazer'::app_role) OR
    has_role(auth.uid(), 'accountant'::app_role) OR
    -- المستفيدون يرون فواتيرهم فقط (إذا كان هناك ربط)
    (
      EXISTS (
        SELECT 1 FROM beneficiaries b
        WHERE b.user_id = auth.uid()
        AND b.email = invoices.customer_email
      )
    )
  );

-- 5. إنشاء دالة لتسجيل محاولات الوصول الفاشلة
CREATE OR REPLACE FUNCTION log_access_attempt(
  p_table_name text,
  p_action text,
  p_success boolean,
  p_details jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (
    action_type,
    table_name,
    user_id,
    user_email,
    description,
    severity,
    ip_address
  )
  SELECT
    p_action,
    p_table_name,
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    CASE WHEN p_success THEN 'Access granted' ELSE 'Access denied' END || ' - ' || p_details::text,
    CASE WHEN p_success THEN 'info' ELSE 'warn' END,
    NULL;
END;
$$;