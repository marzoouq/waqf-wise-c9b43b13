
-- إصلاح تحذيرات الأمان للمستندات
-- حذف السياسات القديمة
DROP POLICY IF EXISTS "documents_insert_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_update_policy" ON public.documents;
DROP POLICY IF EXISTS "documents_delete_policy" ON public.documents;

-- إنشاء سياسات أكثر أماناً - السماح للمستخدمين المسجلين فقط
CREATE POLICY "documents_insert_policy" ON public.documents
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "documents_update_policy" ON public.documents
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "documents_delete_policy" ON public.documents
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- إصلاح الـ View ليكون SECURITY INVOKER
DROP VIEW IF EXISTS public.documents_with_links;
CREATE VIEW public.documents_with_links 
WITH (security_invoker = true)
AS
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
