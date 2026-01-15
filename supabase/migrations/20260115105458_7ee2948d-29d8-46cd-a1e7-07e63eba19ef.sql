-- ============================================
-- إصلاح مشاكل قيود قاعدة البيانات
-- ============================================

-- 1. تعديل قيد tenant_ledger_contract_id_fkey لإضافة ON DELETE CASCADE
-- أولاً حذف القيد القديم إن وجد
ALTER TABLE IF EXISTS public.tenant_ledger 
  DROP CONSTRAINT IF EXISTS tenant_ledger_contract_id_fkey;

-- إعادة إنشاء القيد مع CASCADE
ALTER TABLE public.tenant_ledger 
  ADD CONSTRAINT tenant_ledger_contract_id_fkey 
  FOREIGN KEY (contract_id) 
  REFERENCES public.contracts(id) 
  ON DELETE CASCADE;

-- 2. تحديث قيد invoices_contract_id_fkey لإضافة ON DELETE SET NULL
ALTER TABLE IF EXISTS public.invoices 
  DROP CONSTRAINT IF EXISTS invoices_contract_id_fkey;

ALTER TABLE public.invoices 
  ADD CONSTRAINT invoices_contract_id_fkey 
  FOREIGN KEY (contract_id) 
  REFERENCES public.contracts(id) 
  ON DELETE SET NULL;

-- 3. تحديث قيد maintenance_requests_contract_id_fkey
ALTER TABLE IF EXISTS public.maintenance_requests 
  DROP CONSTRAINT IF EXISTS maintenance_requests_contract_id_fkey;

ALTER TABLE public.maintenance_requests 
  ADD CONSTRAINT maintenance_requests_contract_id_fkey 
  FOREIGN KEY (contract_id) 
  REFERENCES public.contracts(id) 
  ON DELETE SET NULL;

-- 4. تحديث قيد pos_transactions_contract_id_fkey
ALTER TABLE IF EXISTS public.pos_transactions 
  DROP CONSTRAINT IF EXISTS pos_transactions_contract_id_fkey;

ALTER TABLE public.pos_transactions 
  ADD CONSTRAINT pos_transactions_contract_id_fkey 
  FOREIGN KEY (contract_id) 
  REFERENCES public.contracts(id) 
  ON DELETE SET NULL;

-- 5. إنشاء دالة لتحديث occupied تلقائياً بناءً على الوحدات المشغولة فعلياً
CREATE OR REPLACE FUNCTION public.sync_property_occupancy()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_property_id uuid;
  v_occupied_count integer;
BEGIN
  -- تحديد العقار المتأثر
  IF TG_OP = 'DELETE' THEN
    v_property_id := OLD.property_id;
  ELSE
    v_property_id := NEW.property_id;
  END IF;

  -- حساب عدد الوحدات المشغولة فعلياً
  SELECT COUNT(*) INTO v_occupied_count
  FROM public.property_units
  WHERE property_id = v_property_id
    AND occupancy_status = 'مشغول';

  -- تحديث العقار
  UPDATE public.properties
  SET occupied = v_occupied_count,
      updated_at = now()
  WHERE id = v_property_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- إنشاء trigger على property_units
DROP TRIGGER IF EXISTS sync_property_occupancy_trigger ON public.property_units;
CREATE TRIGGER sync_property_occupancy_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.property_units
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_property_occupancy();

-- 6. مزامنة الإشغال الحالي لجميع العقارات
UPDATE public.properties p
SET occupied = COALESCE((
  SELECT COUNT(*) 
  FROM public.property_units pu 
  WHERE pu.property_id = p.id 
    AND pu.occupancy_status = 'مشغول'
), 0),
updated_at = now();