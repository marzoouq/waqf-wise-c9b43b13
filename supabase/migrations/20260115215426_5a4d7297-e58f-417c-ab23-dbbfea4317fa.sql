-- توسيع حقل otp_code ليقبل رقم العقد الكامل
ALTER TABLE public.tenant_otp_codes 
ALTER COLUMN otp_code TYPE VARCHAR(50);