-- إعادة توليد أنواع Supabase Types
-- هذا Migration يضيف metadata لإجبار Supabase على تحديث types.ts

-- تحديث وصف جدول المستفيدين ليشمل beneficiary_number
COMMENT ON TABLE public.beneficiaries IS 'جدول المستفيدين - يحتوي على جميع بيانات المستفيدين من الوقف بما في ذلك رقم المستفيد الفريد';

-- إضافة وصف للحقول المهمة
COMMENT ON COLUMN public.beneficiaries.beneficiary_number IS 'رقم المستفيد الفريد بصيغة B-YYYY-XXXX';
COMMENT ON COLUMN public.beneficiaries.full_name IS 'الاسم الكامل للمستفيد';
COMMENT ON COLUMN public.beneficiaries.national_id IS 'رقم الهوية الوطنية أو الإقامة';
COMMENT ON COLUMN public.beneficiaries.category IS 'فئة المستفيد (الفئة الأولى، الفئة الثانية، إلخ)';
COMMENT ON COLUMN public.beneficiaries.user_id IS 'معرف المستخدم المرتبط للوصول إلى بوابة المستفيدين';

-- تحديث وصف الجداول الأخرى المهمة
COMMENT ON TABLE public.bank_accounts IS 'الحسابات البنكية للوقف';
COMMENT ON TABLE public.families IS 'عائلات المستفيدين';
COMMENT ON TABLE public.payments IS 'المدفوعات للمستفيدين';
COMMENT ON TABLE public.loans IS 'القروض الممنوحة للمستفيدين';
COMMENT ON TABLE public.contracts IS 'عقود الإيجار والعقارات';
COMMENT ON TABLE public.accounts IS 'شجرة الحسابات المحاسبية';
COMMENT ON TABLE public.journal_entries IS 'القيود اليومية المحاسبية';

-- تحديث timestamp لإجبار refresh
ALTER TABLE public.beneficiaries ALTER COLUMN updated_at SET DEFAULT now();
