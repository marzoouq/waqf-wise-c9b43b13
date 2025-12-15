-- ============================================
-- إكمال خطة الإصلاح الأمني - الإصدار المصحح النهائي
-- Complete Security Fix - Final Corrected Version
-- ============================================

-- 8. جدول contracts - حذف السياسة الموجودة ثم إنشاء جديدة
-- ============================================
DROP POLICY IF EXISTS "Contracts viewable by all" ON contracts;
DROP POLICY IF EXISTS "staff_manage_contracts" ON contracts;

CREATE POLICY "staff_manage_contracts" ON contracts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant')
    )
  );

DROP POLICY IF EXISTS "waqf_heir_view_contracts" ON contracts;
CREATE POLICY "waqf_heir_view_contracts" ON contracts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'waqf_heir'
    )
  );

-- 9. جدول profiles - تقييد الوصول
-- ============================================
DROP POLICY IF EXISTS "Profiles viewable by all" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "user_manage_own_profile" ON profiles;
DROP POLICY IF EXISTS "staff_view_all_profiles" ON profiles;

-- المستخدم يرى ويعدل ملفه الشخصي فقط (profiles.user_id موجود)
CREATE POLICY "user_manage_own_profile" ON profiles
  FOR ALL USING (user_id = auth.uid());

-- الموظفين يرون جميع الملفات الشخصية
CREATE POLICY "staff_view_all_profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer')
    )
  );

-- 10. تعزيز سياسات الرسائل والطلبات
-- ============================================

-- contact_messages - ليس لديه user_id، الموظفين فقط يرون
DROP POLICY IF EXISTS "Contact messages viewable by authenticated" ON contact_messages;
DROP POLICY IF EXISTS "contact_messages_sender_or_staff" ON contact_messages;

CREATE POLICY "contact_messages_staff_only" ON contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer')
    )
  );

-- internal_messages - المرسل والمستلم (receiver_id وليس recipient_id)
DROP POLICY IF EXISTS "Internal messages viewable by authenticated" ON internal_messages;
DROP POLICY IF EXISTS "internal_messages_participants_or_staff" ON internal_messages;

CREATE POLICY "internal_messages_participants_or_staff" ON internal_messages
  FOR SELECT USING (
    sender_id = auth.uid()
    OR receiver_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer')
    )
  );

-- support_tickets - صاحب التذكرة أو الموظفين (user_id موجود)
DROP POLICY IF EXISTS "Support tickets viewable by authenticated" ON support_tickets;
DROP POLICY IF EXISTS "support_tickets_owner_or_staff" ON support_tickets;

CREATE POLICY "support_tickets_owner_or_staff" ON support_tickets
  FOR SELECT USING (
    user_id = auth.uid()
    OR assigned_to = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant')
    )
  );

-- beneficiary_requests - صاحب الطلب أو الموظفين
DROP POLICY IF EXISTS "Beneficiary requests viewable by authenticated" ON beneficiary_requests;
DROP POLICY IF EXISTS "beneficiary_requests_owner_or_staff" ON beneficiary_requests;

CREATE POLICY "beneficiary_requests_owner_or_staff" ON beneficiary_requests
  FOR SELECT USING (
    beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant')
    )
  );

-- emergency_aid_requests - صاحب الطلب أو الموظفين
DROP POLICY IF EXISTS "Emergency aid viewable by authenticated" ON emergency_aid_requests;
DROP POLICY IF EXISTS "emergency_aid_owner_or_staff" ON emergency_aid_requests;

CREATE POLICY "emergency_aid_owner_or_staff" ON emergency_aid_requests
  FOR SELECT USING (
    beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'nazer', 'accountant')
    )
  );

-- 11. حذف جدول users_profiles_cache إذا كان موجوداً
-- ============================================
DROP TABLE IF EXISTS users_profiles_cache CASCADE;