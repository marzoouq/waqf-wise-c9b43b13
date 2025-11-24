
-- ============================================
-- Fix Security Issues
-- ============================================

-- حذف Functions القديمة التي ليس لها search_path
DROP FUNCTION IF EXISTS generate_annual_disclosure_data(UUID);
DROP FUNCTION IF EXISTS check_sla_breaches();
DROP FUNCTION IF EXISTS auto_escalate_requests();
DROP FUNCTION IF EXISTS calculate_distribution_allocations(UUID, NUMERIC, JSON);

-- Note: الـ Functions الأخرى (generate_payment_voucher_number, generate_invoice_number, generate_entry_number)
-- تم تعيين search_path = public لها في migrations سابقة
