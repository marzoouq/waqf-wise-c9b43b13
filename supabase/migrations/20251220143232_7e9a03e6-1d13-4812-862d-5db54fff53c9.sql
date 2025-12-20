-- ============================================
-- تحسين RLS Policies للجداول الحساسة
-- Enhanced RLS Policies for Sensitive Tables
-- ============================================

-- 1. تحسين سياسة audit_logs - السماح فقط للنظام والمسؤولين
DROP POLICY IF EXISTS "Authenticated users can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "Only system can insert audit logs" ON audit_logs;

CREATE POLICY "Only admins and system can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (
  current_setting('role', true) = 'service_role'
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 2. إضافة سياسة لمنع تعديل audit_logs (لا يمكن تعديل السجلات)
DROP POLICY IF EXISTS "No one can update audit logs" ON audit_logs;
CREATE POLICY "No one can update audit logs"
ON audit_logs FOR UPDATE
USING (false);

DROP POLICY IF EXISTS "No one can delete audit logs" ON audit_logs;
CREATE POLICY "No one can delete audit logs"
ON audit_logs FOR DELETE
USING (false);

-- 3. تحسين سياسة beneficiaries - إضافة تحقق من user_id
-- أولاً نتحقق من وجود السياسات ونحذفها
DROP POLICY IF EXISTS "beneficiaries_self_access" ON beneficiaries;

-- إضافة سياسة جديدة للمستفيدين لرؤية بياناتهم فقط
CREATE POLICY "beneficiaries_self_access"
ON beneficiaries FOR SELECT
USING (
  -- السماح للمستفيد برؤية بياناته فقط
  user_id = auth.uid()
  -- أو للموظفين المصرح لهم
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant', 'cashier', 'waqf_heir')
  )
);

-- 4. تحسين سياسة loans - منع التلاعب بـ beneficiary_id
DROP POLICY IF EXISTS "loans_beneficiary_self_view" ON loans;

CREATE POLICY "loans_beneficiary_self_view"
ON loans FOR SELECT
USING (
  -- المستفيد يرى قروضه فقط
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  -- أو الموظفين
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

-- 5. تحسين سياسة payments - التأكد من أن المستفيد يرى مدفوعاته فقط
DROP POLICY IF EXISTS "payments_beneficiary_self_view" ON payments;

CREATE POLICY "payments_beneficiary_self_view"
ON payments FOR SELECT
USING (
  -- المستفيد يرى مدفوعاته فقط
  beneficiary_id IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
  -- أو الموظفين
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

-- 6. تحسين سياسة distributions - التحقق من هوية الوريث
DROP POLICY IF EXISTS "distributions_heir_access" ON distributions;

CREATE POLICY "distributions_heir_access"
ON distributions FOR SELECT
USING (
  -- الورثة يمكنهم رؤية جميع التوزيعات (للشفافية)
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'waqf_heir'
  )
  -- أو الموظفين
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'nazer', 'accountant', 'cashier')
  )
);

-- 7. إنشاء function آمنة لإدخال audit logs
CREATE OR REPLACE FUNCTION public.secure_audit_log(
  p_action_type TEXT,
  p_table_name TEXT DEFAULT NULL,
  p_record_id TEXT DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_severity TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_logs (
    action_type,
    table_name,
    record_id,
    description,
    old_values,
    new_values,
    severity,
    user_id,
    user_email,
    created_at
  ) VALUES (
    p_action_type,
    p_table_name,
    p_record_id,
    p_description,
    p_old_values,
    p_new_values,
    p_severity,
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    NOW()
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$;

-- منح الصلاحيات للمستخدمين المصادقين
GRANT EXECUTE ON FUNCTION public.secure_audit_log TO authenticated;