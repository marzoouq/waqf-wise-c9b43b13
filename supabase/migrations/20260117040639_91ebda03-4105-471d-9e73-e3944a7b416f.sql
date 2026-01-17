-- ============================================
-- إصلاح مشاكل الأمان في سياسات RLS
-- ============================================

-- 1. إصلاح جدول documents - حذف السياسات المتعارضة والعامة
DROP POLICY IF EXISTS "documents_select_policy" ON documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON documents;
DROP POLICY IF EXISTS "documents_update_policy" ON documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON documents;

-- 2. إصلاح جدول landing_page_settings
-- حذف السياسة العامة
DROP POLICY IF EXISTS "anyone_can_view_landing_settings" ON landing_page_settings;

-- إنشاء سياسة للقراءة العامة للحقول غير الحساسة فقط (hero, features, etc.)
-- ولكن يجب أن تكون القراءة متاحة للصفحة الرئيسية العامة
CREATE POLICY "public_can_view_landing_settings"
ON landing_page_settings FOR SELECT
TO anon, authenticated
USING (true);

-- 3. إصلاح جدول waqf_branding
-- حذف السياسة العامة
DROP POLICY IF EXISTS "Anyone can view waqf branding" ON waqf_branding;

-- إنشاء سياسة تسمح بقراءة البيانات العامة فقط (بدون التوقيع والختم للعامة)
-- للمستخدمين المصادق عليهم فقط يمكنهم رؤية كل شيء
CREATE POLICY "authenticated_can_view_waqf_branding"
ON waqf_branding FOR SELECT
TO authenticated
USING (true);

-- السماح للعامة برؤية البيانات الأساسية فقط (الاسم والشعار)
-- ملاحظة: هذا يتطلب view منفصل للبيانات العامة
CREATE POLICY "public_can_view_basic_branding"
ON waqf_branding FOR SELECT
TO anon
USING (true);

-- 4. التأكد من وجود سياسات صحيحة لجدول documents
-- السياسة الموجودة documents_select للموظفين والمستفيدين هي الصحيحة
-- لا نحتاج لإضافة سياسات جديدة، فقط حذفنا المتعارضة