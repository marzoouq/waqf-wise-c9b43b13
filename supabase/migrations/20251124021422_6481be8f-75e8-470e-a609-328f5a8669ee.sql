-- إصلاح trigger الإشعارات للفزعات الطارئة
CREATE OR REPLACE FUNCTION notify_emergency_aid_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'معتمد' AND OLD.status != 'معتمد' THEN
    INSERT INTO notifications (title, message, user_id, action_url, type)
    SELECT
      'تم اعتماد طلب الفزعة',
      'تم اعتماد طلب الفزعة رقم ' || NEW.request_number || ' بمبلغ ' || NEW.amount_approved || ' ريال',
      b.user_id,
      '/beneficiary-dashboard',
      'approval'
    FROM beneficiaries b
    WHERE b.id = NEW.beneficiary_id AND b.user_id IS NOT NULL;
  END IF;
  
  IF NEW.status = 'مرفوض' AND OLD.status != 'مرفوض' THEN
    INSERT INTO notifications (title, message, user_id, action_url, type)
    SELECT
      'تم رفض طلب الفزعة',
      'تم رفض طلب الفزعة رقم ' || NEW.request_number,
      b.user_id,
      '/beneficiary-dashboard',
      'rejection'
    FROM beneficiaries b
    WHERE b.id = NEW.beneficiary_id AND b.user_id IS NOT NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;