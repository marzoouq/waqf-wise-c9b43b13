-- إزالة القيد الأجنبي على cashier_id لأنه يسبب مشاكل
ALTER TABLE public.cashier_shifts DROP CONSTRAINT IF EXISTS cashier_shifts_cashier_id_fkey;