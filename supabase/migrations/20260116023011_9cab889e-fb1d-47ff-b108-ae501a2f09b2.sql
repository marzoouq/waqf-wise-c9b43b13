
-- ============================================
-- ربط الأرشفة بالكيانات الأخرى
-- ============================================

-- 1. إضافة أعمدة ربط للمستندات
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS reference_type TEXT,
ADD COLUMN IF NOT EXISTS reference_id UUID,
ADD COLUMN IF NOT EXISTS contract_id UUID REFERENCES contracts(id),
ADD COLUMN IF NOT EXISTS property_id UUID REFERENCES properties(id),
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id),
ADD COLUMN IF NOT EXISTS beneficiary_id UUID REFERENCES beneficiaries(id),
ADD COLUMN IF NOT EXISTS payment_voucher_id UUID REFERENCES payment_vouchers(id),
ADD COLUMN IF NOT EXISTS maintenance_request_id UUID REFERENCES maintenance_requests(id);

-- 2. إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_documents_reference ON public.documents(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_documents_contract ON public.documents(contract_id) WHERE contract_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_property ON public.documents(property_id) WHERE property_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_documents_beneficiary ON public.documents(beneficiary_id) WHERE beneficiary_id IS NOT NULL;

-- 3. دالة للأرشفة التلقائية عند إنشاء السندات
CREATE OR REPLACE FUNCTION public.log_document_creation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- تسجيل في سجل النشاطات
    INSERT INTO public.activities (action, user_name, timestamp)
    VALUES (
        'تم أرشفة مستند: ' || NEW.name,
        'النظام',
        NOW()
    );
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_document ON public.documents;
CREATE TRIGGER trigger_log_document
    AFTER INSERT ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.log_document_creation();

-- 4. عرض للمستندات مع تفاصيل الربط
CREATE OR REPLACE VIEW public.documents_with_links AS
SELECT 
    d.*,
    c.contract_number,
    c.tenant_name AS contract_tenant_name,
    p.name AS property_name,
    t.full_name AS tenant_name,
    b.full_name AS beneficiary_name,
    pv.voucher_number,
    mr.request_number AS maintenance_request_number
FROM public.documents d
LEFT JOIN public.contracts c ON d.contract_id = c.id
LEFT JOIN public.properties p ON d.property_id = p.id
LEFT JOIN public.tenants t ON d.tenant_id = t.id
LEFT JOIN public.beneficiaries b ON d.beneficiary_id = b.id
LEFT JOIN public.payment_vouchers pv ON d.payment_voucher_id = pv.id
LEFT JOIN public.maintenance_requests mr ON d.maintenance_request_id = mr.id;

-- 5. تمكين RLS على المستندات
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة إن وجدت
DROP POLICY IF EXISTS "documents_select_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON public.documents;

-- سياسات جديدة
CREATE POLICY "documents_select_policy" ON public.documents
    FOR SELECT USING (true);

CREATE POLICY "documents_insert_policy" ON public.documents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "documents_update_policy" ON public.documents
    FOR UPDATE USING (true);

CREATE POLICY "documents_delete_policy" ON public.documents
    FOR DELETE USING (true);
