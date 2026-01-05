CREATE OR REPLACE FUNCTION public.update_beneficiary_last_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_last_activity timestamptz;
BEGIN
  -- قراءة last_activity بشكل آمن حتى لو لم يكن الحقل موجوداً في NEW
  v_last_activity := NULLIF(to_jsonb(NEW)->>'last_activity','')::timestamptz;

  UPDATE public.beneficiaries
  SET 
    last_activity_at = COALESCE(v_last_activity, now()),
    updated_at = now()
  WHERE id = NEW.beneficiary_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';