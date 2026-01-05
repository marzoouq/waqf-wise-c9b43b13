-- إسقاط الـ triggers الحالية
DROP TRIGGER IF EXISTS tr_update_beneficiary_on_attachment ON public.beneficiary_attachments;
DROP TRIGGER IF EXISTS tr_update_beneficiary_on_request ON public.beneficiary_requests;
DROP TRIGGER IF EXISTS trigger_update_beneficiary_activity ON public.beneficiary_sessions;

-- التأكد من وجود حقل last_activity_at
ALTER TABLE public.beneficiaries 
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now();

-- إعادة تعريف الدالة بشكل مرن
CREATE OR REPLACE FUNCTION update_beneficiary_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.beneficiaries
  SET 
    last_activity_at = COALESCE(
      CASE WHEN TG_TABLE_NAME = 'beneficiary_sessions' THEN NEW.last_activity ELSE NULL END,
      now()
    ),
    updated_at = now()
  WHERE id = NEW.beneficiary_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- إعادة إنشاء الـ triggers
CREATE TRIGGER trigger_update_beneficiary_activity
AFTER INSERT OR UPDATE ON public.beneficiary_sessions
FOR EACH ROW
EXECUTE FUNCTION update_beneficiary_last_activity();

CREATE TRIGGER tr_update_beneficiary_on_attachment
AFTER INSERT ON public.beneficiary_attachments
FOR EACH ROW
EXECUTE FUNCTION update_beneficiary_last_activity();

CREATE TRIGGER tr_update_beneficiary_on_request
AFTER INSERT OR UPDATE ON public.beneficiary_requests
FOR EACH ROW
EXECUTE FUNCTION update_beneficiary_last_activity();