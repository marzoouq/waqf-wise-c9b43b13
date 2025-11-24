-- إصلاح trigger مع CASCADE
DROP TRIGGER IF EXISTS trigger_request_notifications ON beneficiary_requests CASCADE;
DROP FUNCTION IF EXISTS send_request_notifications() CASCADE;

CREATE OR REPLACE FUNCTION send_request_notifications()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'معتمد' AND (OLD.status IS NULL OR OLD.status != 'معتمد') THEN
    INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, action_url)
    SELECT b.user_id, 'تم اعتماد الطلب', 'تم اعتماد طلبك', 'success', 'request', NEW.id, '/beneficiary/requests'
    FROM beneficiaries b WHERE b.id = NEW.beneficiary_id AND b.user_id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_request_notifications
  AFTER UPDATE ON beneficiary_requests FOR EACH ROW EXECUTE FUNCTION send_request_notifications();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('request-attachments', 'request-attachments', true) ON CONFLICT DO NOTHING;