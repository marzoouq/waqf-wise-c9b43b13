-- إزالة قيد المفتاح الخارجي القديم
ALTER TABLE public.beneficiaries 
DROP CONSTRAINT IF EXISTS beneficiaries_user_id_fkey;

-- إضافة قيد جديد مع ON DELETE SET NULL
ALTER TABLE public.beneficiaries
ADD CONSTRAINT beneficiaries_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE SET NULL;