-- إصلاح قيود urgency_level لتطابق القيم الصحيحة
ALTER TABLE emergency_aid_requests 
DROP CONSTRAINT IF EXISTS emergency_aid_requests_urgency_level_check;

ALTER TABLE emergency_aid_requests
ADD CONSTRAINT emergency_aid_requests_urgency_level_check 
CHECK (urgency_level IN ('عادي', 'عاجل', 'عاجل جداً'));