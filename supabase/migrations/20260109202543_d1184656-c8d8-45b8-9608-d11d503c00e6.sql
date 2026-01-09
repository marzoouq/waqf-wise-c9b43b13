-- إصلاح دالة prevent_duplicate_distribution بإضافة search_path
DROP FUNCTION IF EXISTS public.prevent_duplicate_distribution() CASCADE;

CREATE FUNCTION public.prevent_duplicate_distribution()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    existing_count integer;
BEGIN
    SELECT COUNT(*) INTO existing_count
    FROM heir_distributions
    WHERE beneficiary_id = NEW.beneficiary_id
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NEW.created_at)
    AND status != 'cancelled'
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    
    IF existing_count > 0 THEN
        RAISE EXCEPTION 'توجد توزيعة سابقة لهذا المستفيد في نفس الشهر';
    END IF;
    
    RETURN NEW;
END;
$$;

-- إعادة ربط الـ trigger
CREATE TRIGGER prevent_duplicate_distribution_trigger
    BEFORE INSERT OR UPDATE ON heir_distributions
    FOR EACH ROW
    EXECUTE FUNCTION prevent_duplicate_distribution();