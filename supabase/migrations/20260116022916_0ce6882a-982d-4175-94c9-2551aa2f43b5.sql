
-- ============================================
-- الربط الشامل للتطبيق - Parent-Child Linking
-- ============================================

-- 1. إضافة أعمدة مفقودة للربط
-- إضافة unit_id للعقود إذا لم يكن موجوداً
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'contracts' AND column_name = 'unit_id') THEN
        ALTER TABLE public.contracts ADD COLUMN unit_id uuid REFERENCES property_units(id);
    END IF;
END $$;

-- 2. دالة لتحديث حالة العقد وإنشاء دفعات الإيجار تلقائياً
CREATE OR REPLACE FUNCTION public.sync_contract_with_payments()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    payment_count INTEGER;
    current_date_var DATE;
    payment_amount NUMERIC;
    period_months INTEGER;
BEGIN
    -- عند إنشاء عقد جديد نشط، إنشاء دفعات الإيجار المستقبلية
    IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
        -- تحديد عدد الأشهر حسب تكرار الدفع
        period_months := CASE NEW.payment_frequency
            WHEN 'monthly' THEN 1
            WHEN 'quarterly' THEN 3
            WHEN 'semi_annual' THEN 6
            WHEN 'annual' THEN 12
            ELSE 1
        END;
        
        -- حساب مبلغ الدفعة
        payment_amount := NEW.monthly_rent * period_months;
        
        -- إنشاء دفعات للفترة القادمة
        current_date_var := NEW.start_date;
        payment_count := 0;
        
        WHILE current_date_var <= NEW.end_date AND payment_count < 24 LOOP
            INSERT INTO public.rental_payments (
                contract_id,
                payment_number,
                due_date,
                amount_due,
                status
            ) VALUES (
                NEW.id,
                'RP-' || NEW.contract_number || '-' || LPAD((payment_count + 1)::text, 3, '0'),
                current_date_var,
                payment_amount,
                CASE WHEN current_date_var < CURRENT_DATE THEN 'overdue' ELSE 'pending' END
            )
            ON CONFLICT DO NOTHING;
            
            current_date_var := current_date_var + (period_months || ' months')::interval;
            payment_count := payment_count + 1;
        END LOOP;
    END IF;
    
    -- عند تحديث حالة العقد
    IF TG_OP = 'UPDATE' THEN
        -- إذا تم إلغاء العقد، تحديث الدفعات المعلقة
        IF NEW.status IN ('cancelled', 'terminated') AND OLD.status = 'active' THEN
            UPDATE public.rental_payments 
            SET status = 'cancelled'
            WHERE contract_id = NEW.id AND status IN ('pending', 'overdue');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 3. دالة لإنشاء سند قبض تلقائياً عند دفع الإيجار
CREATE OR REPLACE FUNCTION public.create_receipt_on_rental_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    contract_rec RECORD;
    property_rec RECORD;
    voucher_num TEXT;
    new_payment_id uuid;
BEGIN
    -- فقط عند تغيير الحالة إلى مدفوع
    IF (TG_OP = 'UPDATE' AND NEW.status = 'paid' AND OLD.status != 'paid') 
       OR (TG_OP = 'INSERT' AND NEW.status = 'paid') THEN
        
        -- جلب بيانات العقد
        SELECT * INTO contract_rec FROM public.contracts WHERE id = NEW.contract_id;
        
        -- جلب بيانات العقار
        SELECT * INTO property_rec FROM public.properties WHERE id = contract_rec.property_id;
        
        -- إنشاء رقم السند
        voucher_num := 'REC-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD-HH24MISS');
        
        -- إنشاء سجل في payments إذا لم يكن موجوداً
        IF NEW.payment_id IS NULL THEN
            INSERT INTO public.payments (
                payment_type,
                payment_number,
                payment_date,
                amount,
                payment_method,
                payer_name,
                description,
                contract_id,
                rental_payment_id,
                reference_type,
                reference_id,
                status,
                waqf_unit_id
            ) VALUES (
                'rental',
                'PAY-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD-HH24MISS'),
                COALESCE(NEW.payment_date, CURRENT_DATE),
                COALESCE(NEW.amount_paid, NEW.amount_due),
                COALESCE(NEW.payment_method, 'cash'),
                contract_rec.tenant_name,
                'دفعة إيجار - ' || property_rec.name || ' - ' || contract_rec.contract_number,
                NEW.contract_id,
                NEW.id,
                'rental_payment',
                NEW.id,
                'completed',
                property_rec.waqf_unit_id
            )
            RETURNING id INTO new_payment_id;
            
            -- تحديث rental_payment بـ payment_id
            NEW.payment_id := new_payment_id;
        END IF;
        
        -- إنشاء سند القبض
        INSERT INTO public.payment_vouchers (
            voucher_number,
            voucher_type,
            amount,
            description,
            payment_method,
            status,
            payment_id,
            waqf_unit_id,
            metadata
        ) VALUES (
            voucher_num,
            'receipt',
            COALESCE(NEW.amount_paid, NEW.amount_due),
            'سند قبض - إيجار ' || property_rec.name || ' - ' || contract_rec.tenant_name,
            COALESCE(NEW.payment_method, 'cash'),
            'completed',
            COALESCE(NEW.payment_id, new_payment_id),
            property_rec.waqf_unit_id,
            jsonb_build_object(
                'contract_id', NEW.contract_id,
                'contract_number', contract_rec.contract_number,
                'property_id', contract_rec.property_id,
                'property_name', property_rec.name,
                'tenant_name', contract_rec.tenant_name,
                'rental_payment_id', NEW.id,
                'due_date', NEW.due_date
            )
        )
        ON CONFLICT DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. دالة لإنشاء قيد محاسبي تلقائي عند إنشاء سند
CREATE OR REPLACE FUNCTION public.create_journal_entry_on_voucher()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    entry_num TEXT;
    fiscal_year_rec RECORD;
    new_journal_id uuid;
    debit_account_id uuid;
    credit_account_id uuid;
BEGIN
    -- فقط للسندات المكتملة
    IF NEW.status = 'completed' AND NEW.journal_entry_id IS NULL THEN
        -- جلب السنة المالية الحالية
        SELECT * INTO fiscal_year_rec 
        FROM public.fiscal_years 
        WHERE status = 'active' 
        ORDER BY start_date DESC 
        LIMIT 1;
        
        IF fiscal_year_rec IS NULL THEN
            RETURN NEW;
        END IF;
        
        -- تحديد الحسابات بناءً على نوع السند
        IF NEW.voucher_type = 'receipt' THEN
            -- سند قبض: مدين = النقدية، دائن = إيرادات الإيجار
            SELECT id INTO debit_account_id FROM public.accounts WHERE code = '1101' LIMIT 1;
            SELECT id INTO credit_account_id FROM public.accounts WHERE code = '4101' LIMIT 1;
        ELSE
            -- سند صرف: مدين = مصروفات، دائن = النقدية
            SELECT id INTO debit_account_id FROM public.accounts WHERE code = '5101' LIMIT 1;
            SELECT id INTO credit_account_id FROM public.accounts WHERE code = '1101' LIMIT 1;
        END IF;
        
        -- إذا لم توجد الحسابات، لا تنشئ قيد
        IF debit_account_id IS NULL OR credit_account_id IS NULL THEN
            RETURN NEW;
        END IF;
        
        -- إنشاء رقم القيد
        entry_num := 'JE-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD-HH24MISS');
        
        -- إنشاء القيد
        INSERT INTO public.journal_entries (
            entry_number,
            entry_date,
            fiscal_year_id,
            description,
            reference_type,
            reference_id,
            total_debit,
            total_credit,
            status,
            waqf_unit_id
        ) VALUES (
            entry_num,
            CURRENT_DATE,
            fiscal_year_rec.id,
            NEW.description,
            'payment_voucher',
            NEW.id,
            NEW.amount,
            NEW.amount,
            'posted',
            NEW.waqf_unit_id
        )
        RETURNING id INTO new_journal_id;
        
        -- إنشاء سطور القيد
        INSERT INTO public.journal_entry_lines (journal_entry_id, account_id, debit_amount, credit_amount, description)
        VALUES 
            (new_journal_id, debit_account_id, NEW.amount, 0, NEW.description),
            (new_journal_id, credit_account_id, 0, NEW.amount, NEW.description);
        
        -- تحديث السند بمعرف القيد
        NEW.journal_entry_id := new_journal_id;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 5. دالة لإنشاء سند صرف للصيانة
CREATE OR REPLACE FUNCTION public.create_voucher_on_maintenance_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    property_rec RECORD;
    voucher_num TEXT;
    new_journal_id uuid;
BEGIN
    -- فقط عند اكتمال الصيانة مع تكلفة
    IF NEW.status = 'completed' AND OLD.status != 'completed' AND COALESCE(NEW.actual_cost, 0) > 0 THEN
        
        -- جلب بيانات العقار
        SELECT * INTO property_rec FROM public.properties WHERE id = NEW.property_id;
        
        -- إنشاء رقم السند
        voucher_num := 'PMT-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD-HH24MISS');
        
        -- إنشاء سند الصرف
        INSERT INTO public.payment_vouchers (
            voucher_number,
            voucher_type,
            amount,
            description,
            status,
            waqf_unit_id,
            metadata
        ) VALUES (
            voucher_num,
            'payment',
            NEW.actual_cost,
            'مصروفات صيانة - ' || property_rec.name || ' - ' || NEW.title,
            'completed',
            COALESCE(NEW.waqf_unit_id, property_rec.waqf_unit_id),
            jsonb_build_object(
                'maintenance_request_id', NEW.id,
                'request_number', NEW.request_number,
                'property_id', NEW.property_id,
                'property_name', property_rec.name,
                'category', NEW.category,
                'vendor_name', NEW.vendor_name
            )
        )
        RETURNING journal_entry_id INTO new_journal_id;
        
        -- ربط القيد بطلب الصيانة
        IF new_journal_id IS NOT NULL THEN
            NEW.journal_entry_id := new_journal_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 6. دالة لإنشاء سند صرف للتوزيعات
CREATE OR REPLACE FUNCTION public.create_voucher_on_distribution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    beneficiary_rec RECORD;
    voucher_num TEXT;
BEGIN
    -- فقط للتوزيعات المعتمدة
    IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
        
        -- جلب بيانات المستفيد
        SELECT * INTO beneficiary_rec FROM public.beneficiaries WHERE id = NEW.beneficiary_id;
        
        -- إنشاء رقم السند
        voucher_num := 'DIST-' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD-HH24MISS');
        
        -- إنشاء سند الصرف
        INSERT INTO public.payment_vouchers (
            voucher_number,
            voucher_type,
            amount,
            beneficiary_id,
            description,
            status,
            waqf_unit_id,
            metadata
        ) VALUES (
            voucher_num,
            'payment',
            NEW.share_amount,
            NEW.beneficiary_id,
            'توزيع أرباح - ' || COALESCE(beneficiary_rec.full_name, NEW.heir_type),
            'pending',
            NEW.waqf_unit_id,
            jsonb_build_object(
                'heir_distribution_id', NEW.id,
                'heir_type', NEW.heir_type,
                'beneficiary_name', beneficiary_rec.full_name,
                'fiscal_year_id', NEW.fiscal_year_id,
                'distribution_date', NEW.distribution_date
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- 7. حذف المشغلات القديمة إن وجدت
DROP TRIGGER IF EXISTS trigger_sync_contract_payments ON public.contracts;
DROP TRIGGER IF EXISTS trigger_create_receipt_rental ON public.rental_payments;
DROP TRIGGER IF EXISTS trigger_create_journal_voucher ON public.payment_vouchers;
DROP TRIGGER IF EXISTS trigger_create_voucher_maintenance ON public.maintenance_requests;
DROP TRIGGER IF EXISTS trigger_create_voucher_distribution ON public.heir_distributions;

-- 8. إنشاء المشغلات الجديدة
CREATE TRIGGER trigger_sync_contract_payments
    AFTER INSERT OR UPDATE ON public.contracts
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_contract_with_payments();

CREATE TRIGGER trigger_create_receipt_rental
    BEFORE INSERT OR UPDATE ON public.rental_payments
    FOR EACH ROW
    EXECUTE FUNCTION public.create_receipt_on_rental_payment();

CREATE TRIGGER trigger_create_journal_voucher
    BEFORE INSERT OR UPDATE ON public.payment_vouchers
    FOR EACH ROW
    EXECUTE FUNCTION public.create_journal_entry_on_voucher();

CREATE TRIGGER trigger_create_voucher_maintenance
    BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.create_voucher_on_maintenance_completion();

CREATE TRIGGER trigger_create_voucher_distribution
    AFTER INSERT OR UPDATE ON public.heir_distributions
    FOR EACH ROW
    EXECUTE FUNCTION public.create_voucher_on_distribution();

-- 9. دالة لتحديث أرصدة المستفيدين تلقائياً
CREATE OR REPLACE FUNCTION public.update_beneficiary_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- عند صرف سند للمستفيد
    IF NEW.status = 'completed' AND NEW.beneficiary_id IS NOT NULL THEN
        UPDATE public.beneficiaries
        SET 
            total_received = COALESCE(total_received, 0) + NEW.amount,
            total_payments = COALESCE(total_payments, 0) + 1,
            updated_at = NOW()
        WHERE id = NEW.beneficiary_id;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_beneficiary_balance ON public.payment_vouchers;
CREATE TRIGGER trigger_update_beneficiary_balance
    AFTER UPDATE ON public.payment_vouchers
    FOR EACH ROW
    WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
    EXECUTE FUNCTION public.update_beneficiary_balance();

-- 10. دالة لتحديث إحصائيات العقار من المدفوعات
CREATE OR REPLACE FUNCTION public.update_property_revenue()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    contract_rec RECORD;
    total_revenue NUMERIC;
BEGIN
    -- جلب العقد
    SELECT * INTO contract_rec FROM public.contracts WHERE id = NEW.contract_id;
    
    IF contract_rec IS NOT NULL THEN
        -- حساب إجمالي الإيرادات
        SELECT COALESCE(SUM(amount_paid), 0) INTO total_revenue
        FROM public.rental_payments
        WHERE contract_id = NEW.contract_id AND status = 'paid';
        
        -- تحديث العقار
        UPDATE public.properties
        SET 
            monthly_revenue = (
                SELECT COALESCE(SUM(c.monthly_rent), 0)
                FROM public.contracts c
                WHERE c.property_id = contract_rec.property_id AND c.status = 'active'
            ),
            updated_at = NOW()
        WHERE id = contract_rec.property_id;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_property_revenue ON public.rental_payments;
CREATE TRIGGER trigger_update_property_revenue
    AFTER INSERT OR UPDATE ON public.rental_payments
    FOR EACH ROW
    WHEN (NEW.status = 'paid')
    EXECUTE FUNCTION public.update_property_revenue();

-- 11. تمكين Realtime للجداول المهمة
ALTER PUBLICATION supabase_realtime ADD TABLE public.rental_payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payment_vouchers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.maintenance_requests;
