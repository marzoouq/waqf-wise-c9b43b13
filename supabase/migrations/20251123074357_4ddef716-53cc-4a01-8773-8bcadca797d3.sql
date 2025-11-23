-- Migration: إصلاح Security Definer Views - النسخة المحدّثة
-- تحديث Views الموجودة فقط إلى SECURITY INVOKER

-- 1. beneficiary_statistics (موجود)
DROP VIEW IF EXISTS beneficiary_statistics CASCADE;
CREATE VIEW beneficiary_statistics 
WITH (security_invoker = true) AS
SELECT 
  b.id,
  b.full_name,
  b.beneficiary_number,
  b.category,
  b.status,
  COUNT(DISTINCT br.id) as total_requests,
  COUNT(DISTINCT ba.id) as total_attachments,
  COALESCE(SUM(dd.allocated_amount), 0) as total_distributions
FROM beneficiaries b
LEFT JOIN beneficiary_requests br ON br.beneficiary_id = b.id
LEFT JOIN beneficiary_attachments ba ON ba.beneficiary_id = b.id
LEFT JOIN distribution_details dd ON dd.beneficiary_id = b.id
GROUP BY b.id, b.full_name, b.beneficiary_number, b.category, b.status;

-- 2. distribution_statistics (موجود)
DROP VIEW IF EXISTS distribution_statistics CASCADE;
CREATE VIEW distribution_statistics
WITH (security_invoker = true) AS
SELECT 
  d.id,
  d.distribution_date,
  d.total_amount,
  d.status,
  COUNT(DISTINCT dd.id) as beneficiaries_count,
  COALESCE(SUM(dd.allocated_amount), 0) as total_distributed
FROM distributions d
LEFT JOIN distribution_details dd ON dd.distribution_id = d.id
GROUP BY d.id, d.distribution_date, d.total_amount, d.status;

-- 3. payment_vouchers_with_details (موجود)
DROP VIEW IF EXISTS payment_vouchers_with_details CASCADE;
CREATE VIEW payment_vouchers_with_details
WITH (security_invoker = true) AS
SELECT 
  pv.*,
  d.id as distribution_id_ref,
  d.distribution_date,
  btf.file_number as bank_transfer_file_number,
  btf.status as bank_transfer_status
FROM payment_vouchers pv
LEFT JOIN distributions d ON d.id = pv.distribution_id
LEFT JOIN bank_transfer_files btf ON btf.distribution_id = d.id;

-- 4. users_with_roles (موجود)
DROP VIEW IF EXISTS users_with_roles CASCADE;
CREATE VIEW users_with_roles
WITH (security_invoker = true) AS
SELECT 
  p.user_id,
  p.full_name,
  p.email,
  p.avatar_url,
  ARRAY_AGG(ur.role) as roles
FROM profiles p
LEFT JOIN user_roles ur ON ur.user_id = p.user_id
GROUP BY p.user_id, p.full_name, p.email, p.avatar_url;