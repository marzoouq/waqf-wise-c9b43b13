-- إصلاح heir_distributions constraint فقط
ALTER TABLE heir_distributions DROP CONSTRAINT IF EXISTS heir_distributions_heir_type_check;

ALTER TABLE heir_distributions 
ADD CONSTRAINT heir_distributions_heir_type_check 
CHECK (heir_type IN ('wife', 'son', 'daughter', 'زوجة', 'ابن', 'بنت'));