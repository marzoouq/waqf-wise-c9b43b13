-- ==========================================================
-- التراجع: إعادة سياسات الشفافية للمستفيدين من الدرجة الأولى
-- Date: 2025-11-29
-- ==========================================================

-- 1. إعادة سياسة contact_messages للمستخدمين المصادقين
DROP POLICY IF EXISTS "Only admins and nazer can view contact messages" ON contact_messages;

CREATE POLICY "Authenticated users can view contact messages"
  ON contact_messages
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- 2. إعادة سياسة contracts للمستفيدين
CREATE POLICY "المستفيدون يمكنهم قراءة جميع العقود"
  ON contracts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'beneficiary'::app_role
    )
  );

-- 3. إعادة سياسة rental_payments للمستفيدين من الدرجة الأولى
DROP POLICY IF EXISTS "staff_can_view_all_rental_payments" ON rental_payments;

CREATE POLICY "rental_payments_view_policy"
  ON rental_payments
  FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nazer'::app_role) OR
    has_role(auth.uid(), 'accountant'::app_role) OR
    has_role(auth.uid(), 'cashier'::app_role) OR
    is_first_class_beneficiary()
  );

-- 4. إعادة سياسة invoices للمستفيدين من الدرجة الأولى
DROP POLICY IF EXISTS "staff_and_own_invoices_policy" ON invoices;

CREATE POLICY "first_class_beneficiaries_can_view_invoices"
  ON invoices
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin'::app_role, 'nazer'::app_role, 'accountant'::app_role)
    )
    OR is_first_class_beneficiary()
  );