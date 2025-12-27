-- إصلاح دالة get_available_recipients
-- المشكلة: current_role يتعارض مع دالة PostgreSQL المدمجة
-- الحل: تغيير اسم المتغير إلى user_role_value

CREATE OR REPLACE FUNCTION public.get_available_recipients(current_user_id uuid)
RETURNS TABLE (id uuid, name text, role text, role_key text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_value app_role;  -- اسم جديد لتجنب التعارض مع current_role()
  allowed_roles app_role[];
BEGIN
  -- جلب دور المستخدم الحالي
  SELECT ur.role INTO user_role_value
  FROM user_roles ur
  WHERE ur.user_id = current_user_id
  LIMIT 1;

  -- تحديد الأدوار المتاحة للمراسلة
  IF user_role_value IN ('beneficiary'::app_role, 'waqf_heir'::app_role) THEN
    -- المستفيدون والورثة يمكنهم مراسلة الإدارة فقط (ناظر + مشرف)
    allowed_roles := ARRAY['admin', 'nazer']::app_role[];
  ELSE
    -- الموظفون يمكنهم مراسلة الجميع
    allowed_roles := ARRAY['admin', 'nazer', 'accountant', 'cashier', 'beneficiary', 'waqf_heir', 'archivist']::app_role[];
  END IF;

  RETURN QUERY
  SELECT 
    p.user_id as id,
    COALESCE(p.full_name, 'مستخدم') as name,
    CASE ur.role::text
      WHEN 'admin' THEN 'مشرف'
      WHEN 'nazer' THEN 'ناظر'
      WHEN 'accountant' THEN 'محاسب'
      WHEN 'cashier' THEN 'صراف'
      WHEN 'beneficiary' THEN 'مستفيد'
      WHEN 'archivist' THEN 'أرشيفي'
      WHEN 'waqf_heir' THEN 'وارث'
      ELSE ur.role::text
    END as role,
    ur.role::text as role_key
  FROM user_roles ur
  INNER JOIN profiles p ON ur.user_id = p.user_id
  WHERE ur.role = ANY(allowed_roles)
    AND ur.user_id != current_user_id
  ORDER BY 
    CASE ur.role
      WHEN 'nazer' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'accountant' THEN 3
      WHEN 'cashier' THEN 4
      WHEN 'archivist' THEN 5
      WHEN 'beneficiary' THEN 6
      WHEN 'waqf_heir' THEN 7
      ELSE 99
    END,
    p.full_name;
END;
$$;