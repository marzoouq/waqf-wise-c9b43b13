-- إصلاح مسار البحث للدالة
CREATE OR REPLACE FUNCTION public.update_beneficiary_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.beneficiaries
  SET last_activity_at = NEW.last_activity
  WHERE id = NEW.beneficiary_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;