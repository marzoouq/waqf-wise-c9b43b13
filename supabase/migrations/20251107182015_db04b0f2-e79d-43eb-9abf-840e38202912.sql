-- ============================================
-- إصلاحات أمنية شاملة - RLS Policies
-- ============================================

-- 1. إزالة كل الـ Public Policies الخطرة
-- ============================================

-- حذف policies من beneficiaries
DROP POLICY IF EXISTS "Allow public delete on beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Allow public insert on beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Allow public read on beneficiaries" ON public.beneficiaries;
DROP POLICY IF EXISTS "Allow public update on beneficiaries" ON public.beneficiaries;

-- حذف policies من documents
DROP POLICY IF EXISTS "Allow public insert on documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public read on documents" ON public.documents;
DROP POLICY IF EXISTS "Allow public update on documents" ON public.documents;

-- حذف policies من distributions
DROP POLICY IF EXISTS "Allow public insert on distributions" ON public.distributions;
DROP POLICY IF EXISTS "Allow public read on distributions" ON public.distributions;
DROP POLICY IF EXISTS "Allow public update on distributions" ON public.distributions;

-- حذف policies من folders
DROP POLICY IF EXISTS "Allow public insert on folders" ON public.folders;
DROP POLICY IF EXISTS "Allow public read on folders" ON public.folders;
DROP POLICY IF EXISTS "Allow public update on folders" ON public.folders;

-- حذف policies من properties
DROP POLICY IF EXISTS "Allow public delete on properties" ON public.properties;
DROP POLICY IF EXISTS "Allow public insert on properties" ON public.properties;
DROP POLICY IF EXISTS "Allow public read on properties" ON public.properties;
DROP POLICY IF EXISTS "Allow public update on properties" ON public.properties;

-- 2. إنشاء Policies آمنة مع التحقق من الصلاحيات
-- ============================================

-- Beneficiaries: بيانات حساسة - فقط للـ admins والمستخدمين المصادقين
CREATE POLICY "Authenticated users can view beneficiaries"
ON public.beneficiaries
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert beneficiaries"
ON public.beneficiaries
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update beneficiaries"
ON public.beneficiaries
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete beneficiaries"
ON public.beneficiaries
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Documents: مستندات حساسة - فقط للمستخدمين المصادقين
CREATE POLICY "Authenticated users can view documents"
ON public.documents
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert documents"
ON public.documents
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update documents"
ON public.documents
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete documents"
ON public.documents
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Distributions: توزيعات مالية - فقط للمستخدمين المصادقين
CREATE POLICY "Authenticated users can view distributions"
ON public.distributions
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert distributions"
ON public.distributions
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update distributions"
ON public.distributions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete distributions"
ON public.distributions
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Folders: مجلدات - فقط للمستخدمين المصادقين
CREATE POLICY "Authenticated users can view folders"
ON public.folders
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert folders"
ON public.folders
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update folders"
ON public.folders
FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Admins can delete folders"
ON public.folders
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Properties: عقارات - فقط للمستخدمين المصادقين
CREATE POLICY "Authenticated users can view properties"
ON public.properties
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can insert properties"
ON public.properties
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update properties"
ON public.properties
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete properties"
ON public.properties
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. إصلاح Database Functions - تأمين search_path
-- ============================================

-- تحديث handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  
  -- Assign user role by default
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$function$;

-- تحديث update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- has_role function is already secure with search_path

-- 4. إضافة تعليقات توضيحية
-- ============================================

COMMENT ON POLICY "Authenticated users can view beneficiaries" ON public.beneficiaries IS 
'يسمح للمستخدمين المصادقين بعرض بيانات المستفيدين';

COMMENT ON POLICY "Admins can insert beneficiaries" ON public.beneficiaries IS 
'فقط المدراء يمكنهم إضافة مستفيدين جدد';

COMMENT ON POLICY "Authenticated users can view documents" ON public.documents IS 
'يسمح للمستخدمين المصادقين بعرض المستندات';

COMMENT ON POLICY "Admins can delete documents" ON public.documents IS 
'فقط المدراء يمكنهم حذف المستندات';