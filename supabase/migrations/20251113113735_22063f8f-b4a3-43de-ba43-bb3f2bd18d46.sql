-- دالة لتعيين دور لمستخدم موجود
CREATE OR REPLACE FUNCTION public.assign_user_role(
  p_email TEXT,
  p_role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- البحث عن المستخدم بالبريد الإلكتروني
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'المستخدم غير موجود: %', p_email;
  END IF;
  
  -- حذف الأدوار القديمة
  DELETE FROM public.user_roles WHERE user_id = v_user_id;
  
  -- إضافة الدور الجديد
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, p_role);
END;
$$;

-- منح الصلاحيات للمستخدمين المصادق عليهم
GRANT EXECUTE ON FUNCTION public.assign_user_role(TEXT, app_role) TO authenticated;

-- إنشاء دالة لإعداد جميع الحسابات التجريبية
CREATE OR REPLACE FUNCTION public.setup_demo_accounts()
RETURNS TABLE(email TEXT, role TEXT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  demo_accounts TEXT[][] := ARRAY[
    ['nazer@waqf.sa', 'nazer'],
    ['admin@waqf.sa', 'admin'],
    ['accountant@waqf.sa', 'accountant'],
    ['cashier@waqf.sa', 'cashier'],
    ['archivist@waqf.sa', 'archivist'],
    ['beneficiary@waqf.sa', 'beneficiary'],
    ['user@waqf.sa', 'user']
  ];
  demo_account TEXT[];
BEGIN
  FOREACH demo_account SLICE 1 IN ARRAY demo_accounts
  LOOP
    BEGIN
      -- البحث عن المستخدم
      SELECT id INTO v_user_id
      FROM auth.users
      WHERE auth.users.email = demo_account[1];
      
      IF v_user_id IS NOT NULL THEN
        -- حذف الأدوار القديمة
        DELETE FROM public.user_roles WHERE user_id = v_user_id;
        
        -- إضافة الدور الجديد
        INSERT INTO public.user_roles (user_id, role)
        VALUES (v_user_id, demo_account[2]::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RETURN QUERY SELECT demo_account[1], demo_account[2], 'تم تعيين الدور'::TEXT;
      ELSE
        RETURN QUERY SELECT demo_account[1], demo_account[2], 'المستخدم غير موجود'::TEXT;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN QUERY SELECT demo_account[1], demo_account[2], 'خطأ: ' || SQLERRM;
    END;
  END LOOP;
END;
$$;

-- منح الصلاحيات
GRANT EXECUTE ON FUNCTION public.setup_demo_accounts() TO authenticated;