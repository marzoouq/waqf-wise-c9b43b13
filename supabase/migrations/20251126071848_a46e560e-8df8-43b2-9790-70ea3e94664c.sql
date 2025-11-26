-- إنشاء دالة آمنة للبحث عن بريد المستفيد برقم الهوية (لتسجيل الدخول)
CREATE OR REPLACE FUNCTION public.get_beneficiary_email_by_national_id(p_national_id text)
RETURNS TABLE (
  email text,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT b.email, b.user_id
  FROM public.beneficiaries b
  WHERE b.national_id = p_national_id
    AND b.can_login = true
    AND b.user_id IS NOT NULL
    AND b.email IS NOT NULL
  LIMIT 1;
END;
$$;

-- منح صلاحية تنفيذ الدالة للمستخدمين المجهولين (anon) والمصادقين (authenticated)
GRANT EXECUTE ON FUNCTION public.get_beneficiary_email_by_national_id(text) TO anon, authenticated;