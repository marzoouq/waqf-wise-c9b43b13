
-- =====================================================
-- تنظيف سياسات profiles المتكررة
-- =====================================================

-- حذف السياسات المتكررة
DROP POLICY IF EXISTS "profiles_admin_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_self" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_unified" ON profiles;
DROP POLICY IF EXISTS "profiles_select_unified" ON profiles;
DROP POLICY IF EXISTS "profiles_staff_view_all" ON profiles;
DROP POLICY IF EXISTS "profiles_update_self" ON profiles;
DROP POLICY IF EXISTS "profiles_update_unified" ON profiles;
DROP POLICY IF EXISTS "profiles_view_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_unified" ON profiles;
DROP POLICY IF EXISTS "staff_view_all_profiles" ON profiles;
DROP POLICY IF EXISTS "user_insert_own_profile" ON profiles;
DROP POLICY IF EXISTS "user_update_own_profile" ON profiles;
DROP POLICY IF EXISTS "user_view_own_profile" ON profiles;

-- إنشاء سياسات موحدة وآمنة
CREATE POLICY "profiles_select" ON profiles
FOR SELECT USING (
  user_id = auth.uid() OR is_staff_only()
);

CREATE POLICY "profiles_insert" ON profiles
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR is_admin_or_nazer()
);

CREATE POLICY "profiles_update" ON profiles
FOR UPDATE USING (
  user_id = auth.uid() OR is_admin_or_nazer()
);

CREATE POLICY "profiles_delete" ON profiles
FOR DELETE USING (
  is_admin_or_nazer()
);

-- =====================================================
-- تنظيف سياسات internal_messages المتكررة
-- =====================================================

DROP POLICY IF EXISTS "Users send messages" ON internal_messages;
DROP POLICY IF EXISTS "Users update own sent messages" ON internal_messages;
DROP POLICY IF EXISTS "Users view own messages" ON internal_messages;
DROP POLICY IF EXISTS "user_send_messages" ON internal_messages;
DROP POLICY IF EXISTS "user_update_own_messages" ON internal_messages;
DROP POLICY IF EXISTS "user_view_own_messages" ON internal_messages;
DROP POLICY IF EXISTS "المستخدمون يمكنهم إرسال رسائل" ON internal_messages;
DROP POLICY IF EXISTS "المستخدمون يمكنهم قراءة رسائلهم" ON internal_messages;
DROP POLICY IF EXISTS "المستقبل يمكنه تحديث حالة القراءة" ON internal_messages;

-- إنشاء سياسات موحدة
CREATE POLICY "messages_select" ON internal_messages
FOR SELECT USING (
  sender_id = auth.uid() OR receiver_id = auth.uid() OR is_admin_or_nazer()
);

CREATE POLICY "messages_insert" ON internal_messages
FOR INSERT WITH CHECK (
  sender_id = auth.uid()
);

CREATE POLICY "messages_update" ON internal_messages
FOR UPDATE USING (
  sender_id = auth.uid() OR receiver_id = auth.uid()
);
