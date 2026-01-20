-- إضافة أعمدة soft-delete إلى جدول user_roles إذا لم تكن موجودة
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_roles' AND column_name = 'deleted_at') THEN
    ALTER TABLE public.user_roles ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
    ALTER TABLE public.user_roles ADD COLUMN deleted_by UUID DEFAULT NULL;
    ALTER TABLE public.user_roles ADD COLUMN deletion_reason TEXT DEFAULT NULL;
    
    -- إنشاء فهرس جزئي لتحسين الأداء
    CREATE INDEX IF NOT EXISTS idx_user_roles_active ON public.user_roles (user_id, role) WHERE deleted_at IS NULL;
    
    COMMENT ON COLUMN public.user_roles.deleted_at IS 'Soft delete timestamp';
    COMMENT ON COLUMN public.user_roles.deleted_by IS 'User who performed the soft delete';
    COMMENT ON COLUMN public.user_roles.deletion_reason IS 'Reason for the soft deletion';
  END IF;
END $$;

-- تحديث بيانات profiles للمستخدمين الإداريين
UPDATE public.profiles 
SET full_name = COALESCE(full_name, 'مدير النظام'),
    email = COALESCE(email, 'admin@waqf.internal')
WHERE id = 'a44b7ccd-c78a-41eb-8bb2-7c24ccac7c27';

UPDATE public.profiles 
SET full_name = COALESCE(full_name, 'ناظر الوقف'),
    email = COALESCE(email, 'nazer@waqf.internal')
WHERE id = 'c0f6bd1b-c23c-4c6c-b1f9-a4ee52b32f9e';