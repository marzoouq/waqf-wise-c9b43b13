-- =====================================================
-- Historical Rental Details System
-- نظام تفاصيل الإيجارات التاريخية للشفافية
-- Version: 2.8.76
-- =====================================================

-- 1. إنشاء الجدول الرئيسي
CREATE TABLE public.historical_rental_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fiscal_year_closing_id UUID NOT NULL REFERENCES public.fiscal_year_closings(id) ON DELETE CASCADE,
  month_date DATE NOT NULL,
  contract_number VARCHAR(50),
  unit_number VARCHAR(20),
  floor_number INTEGER,
  tenant_name VARCHAR(255) NOT NULL,
  contract_start_date DATE,
  contract_end_date DATE,
  annual_contract_value DECIMAL(12,2),
  monthly_payment DECIMAL(12,2) DEFAULT 0,
  payment_status VARCHAR(20) DEFAULT 'paid' CHECK (payment_status IN ('paid', 'unpaid', 'vacant')),
  property_name VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_rental_entry UNIQUE(fiscal_year_closing_id, month_date, contract_number, unit_number)
);

-- 2. إنشاء الفهارس للأداء
CREATE INDEX idx_hrd_fiscal_year_closing ON public.historical_rental_details(fiscal_year_closing_id);
CREATE INDEX idx_hrd_month_date ON public.historical_rental_details(month_date);
CREATE INDEX idx_hrd_payment_status ON public.historical_rental_details(payment_status);
CREATE INDEX idx_hrd_tenant_name ON public.historical_rental_details(tenant_name);

-- 3. تفعيل RLS
ALTER TABLE public.historical_rental_details ENABLE ROW LEVEL SECURITY;

-- 4. سياسات RLS المصححة
-- سياسة القراءة: الورثة + الموظفين
CREATE POLICY "heirs_staff_select_historical_rental"
ON public.historical_rental_details
FOR SELECT TO authenticated
USING (
  has_role(auth.uid(), 'waqf_heir'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role) OR 
  has_role(auth.uid(), 'archivist'::app_role)
);

-- سياسة الإضافة: الناظر والمحاسب فقط
CREATE POLICY "nazer_accountant_insert_historical_rental"
ON public.historical_rental_details
FOR INSERT TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role)
);

-- سياسة التعديل: الناظر والمحاسب فقط
CREATE POLICY "nazer_accountant_update_historical_rental"
ON public.historical_rental_details
FOR UPDATE TO authenticated
USING (
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role)
);

-- سياسة الحذف: الناظر والمحاسب فقط
CREATE POLICY "nazer_accountant_delete_historical_rental"
ON public.historical_rental_details
FOR DELETE TO authenticated
USING (
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role)
);

-- 5. إنشاء View للملخص الشهري
CREATE OR REPLACE VIEW public.historical_rental_monthly_summary AS
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

-- 6. Trigger لتحديث updated_at
CREATE TRIGGER update_historical_rental_details_updated_at
BEFORE UPDATE ON public.historical_rental_details
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 7. تفعيل Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.historical_rental_details;