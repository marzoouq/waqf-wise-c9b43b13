-- إضافة عمود status لجدول heir_distributions
ALTER TABLE heir_distributions 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'مدفوع';

-- تحديث جميع السجلات الحالية لتكون مدفوعة (لأن لها payments مرتبطة)
UPDATE heir_distributions SET status = 'مدفوع' WHERE status IS NULL;

-- تنظيف الأخطاء القديمة المحلولة (أكثر من يوم)
DELETE FROM system_error_logs 
WHERE status = 'resolved' 
AND created_at < NOW() - INTERVAL '1 day';

-- إضافة عمود remaining_balance لجدول loans إذا لم يكن موجوداً
ALTER TABLE loans 
ADD COLUMN IF NOT EXISTS remaining_balance NUMERIC DEFAULT 0;

-- تحديث remaining_balance للقروض الموجودة
UPDATE loans 
SET remaining_balance = loan_amount - COALESCE(paid_amount, 0)
WHERE remaining_balance IS NULL OR remaining_balance = 0;