-- Fix Security Definer View - use SECURITY INVOKER
DROP VIEW IF EXISTS public.historical_rental_monthly_summary;

CREATE VIEW public.historical_rental_monthly_summary 
WITH (security_invoker = true)
AS
SELECT 
  fiscal_year_closing_id,
  month_date,
  TO_CHAR(month_date, 'YYYY-MM') as month_year,
  TO_CHAR(month_date, 'Month YYYY') as month_label,
  COUNT(*) as total_units,
  COUNT(*) FILTER (WHERE payment_status = 'paid') as paid_count,
  COUNT(*) FILTER (WHERE payment_status = 'unpaid') as unpaid_count,
  COUNT(*) FILTER (WHERE payment_status = 'vacant') as vacant_count,
  COALESCE(SUM(monthly_payment), 0) as total_collected,
  COALESCE(SUM(monthly_payment) FILTER (WHERE payment_status = 'paid'), 0) as paid_amount
FROM public.historical_rental_details
GROUP BY fiscal_year_closing_id, month_date
ORDER BY month_date;