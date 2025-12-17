-- 1. إنشاء Function لإرسال إشعار تلقائي عند تغيير حالة الطلب
CREATE OR REPLACE FUNCTION public.notify_on_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_beneficiary_name TEXT;
  v_request_type TEXT;
BEGIN
  -- فقط عند تغيير الحالة
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- جلب user_id للمستفيد
    SELECT b.user_id, b.full_name INTO v_user_id, v_beneficiary_name
    FROM beneficiaries b WHERE b.id = NEW.beneficiary_id;
    
    -- جلب نوع الطلب
    SELECT name_ar INTO v_request_type
    FROM request_types WHERE id = NEW.request_type_id;
    
    IF v_user_id IS NOT NULL THEN
      -- إنشاء إشعار عند الموافقة
      IF NEW.status = 'موافق' THEN
        INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, action_url, priority)
        VALUES (
          v_user_id, 
          'تمت الموافقة على طلبك ✓', 
          'تمت الموافقة على طلب ' || COALESCE(v_request_type, 'طلب') || ' رقم ' || COALESCE(NEW.request_number, NEW.id::TEXT),
          'success', 
          'request', 
          NEW.id, 
          '/beneficiary/requests',
          'high'
        );
      -- إنشاء إشعار عند الرفض
      ELSIF NEW.status = 'مرفوض' THEN
        INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, action_url, priority)
        VALUES (
          v_user_id, 
          'تم رفض طلبك',
          'تم رفض طلب ' || COALESCE(v_request_type, 'طلب') || ' رقم ' || COALESCE(NEW.request_number, NEW.id::TEXT) || 
          CASE WHEN NEW.rejection_reason IS NOT NULL THEN ': ' || NEW.rejection_reason ELSE '' END,
          'error', 
          'request', 
          NEW.id, 
          '/beneficiary/requests',
          'high'
        );
      -- إنشاء إشعار عند بدء المراجعة
      ELSIF NEW.status = 'قيد المراجعة' AND OLD.status = 'معلق' THEN
        INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, action_url, priority)
        VALUES (
          v_user_id, 
          'طلبك قيد المراجعة',
          'طلب ' || COALESCE(v_request_type, 'طلب') || ' رقم ' || COALESCE(NEW.request_number, NEW.id::TEXT) || ' قيد المراجعة الآن',
          'info', 
          'request', 
          NEW.id, 
          '/beneficiary/requests',
          'medium'
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. إنشاء Trigger على جدول الطلبات
DROP TRIGGER IF EXISTS trigger_notify_request_status ON beneficiary_requests;
CREATE TRIGGER trigger_notify_request_status
  AFTER UPDATE ON beneficiary_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_request_status_change();

-- 3. إنشاء Function لإشعارات طلبات الفزعة الطارئة
CREATE OR REPLACE FUNCTION public.notify_on_emergency_aid_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_beneficiary_name TEXT;
BEGIN
  -- فقط عند تغيير الحالة
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- جلب user_id للمستفيد
    SELECT b.user_id, b.full_name INTO v_user_id, v_beneficiary_name
    FROM beneficiaries b WHERE b.id = NEW.beneficiary_id;
    
    IF v_user_id IS NOT NULL THEN
      -- إنشاء إشعار عند الموافقة
      IF NEW.status = 'موافق' THEN
        INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, action_url, priority)
        VALUES (
          v_user_id, 
          'تمت الموافقة على طلب الفزعة الطارئة ✓', 
          'تمت الموافقة على طلب المساعدة الطارئة بمبلغ ' || NEW.approved_amount::TEXT || ' ريال',
          'success', 
          'emergency_aid', 
          NEW.id, 
          '/beneficiary/requests',
          'urgent'
        );
      -- إنشاء إشعار عند الرفض
      ELSIF NEW.status = 'مرفوض' THEN
        INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, action_url, priority)
        VALUES (
          v_user_id, 
          'تم رفض طلب الفزعة الطارئة',
          'تم رفض طلب المساعدة الطارئة' || 
          CASE WHEN NEW.rejection_reason IS NOT NULL THEN ': ' || NEW.rejection_reason ELSE '' END,
          'error', 
          'emergency_aid', 
          NEW.id, 
          '/beneficiary/requests',
          'high'
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. إنشاء Trigger على جدول الفزعات الطارئة
DROP TRIGGER IF EXISTS trigger_notify_emergency_aid_status ON emergency_aid_requests;
CREATE TRIGGER trigger_notify_emergency_aid_status
  AFTER UPDATE ON emergency_aid_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_emergency_aid_status_change();

-- 5. إنشاء notification_settings الافتراضية للمستفيدين الحاليين
INSERT INTO notification_settings (user_id, beneficiary_id, email_enabled, sms_enabled, push_enabled, in_app_enabled, distribution_notifications, request_notifications, payment_notifications, loan_notifications, system_notifications)
SELECT 
  b.user_id,
  b.id,
  true,   -- email
  false,  -- sms
  true,   -- push
  true,   -- in_app
  true,   -- distribution
  true,   -- request
  true,   -- payment
  true,   -- loan
  true    -- system
FROM beneficiaries b
WHERE b.user_id IS NOT NULL
AND NOT EXISTS (SELECT 1 FROM notification_settings ns WHERE ns.beneficiary_id = b.id)
ON CONFLICT DO NOTHING;

-- 6. إنشاء Function لإرسال إشعار عند توزيع جديد
CREATE OR REPLACE FUNCTION public.notify_on_distribution_created()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_beneficiary_name TEXT;
BEGIN
  -- جلب user_id للمستفيد
  SELECT b.user_id, b.full_name INTO v_user_id, v_beneficiary_name
  FROM beneficiaries b WHERE b.id = NEW.beneficiary_id;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, title, message, type, reference_type, reference_id, action_url, priority)
    VALUES (
      v_user_id, 
      'تم إيداع مبلغ التوزيع ✓', 
      'تم إيداع مبلغ ' || NEW.allocated_amount::TEXT || ' ريال في حسابك من توزيع الغلة',
      'success', 
      'distribution', 
      NEW.distribution_id, 
      '/beneficiary/distributions',
      'high'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. إنشاء Trigger على جدول تفاصيل التوزيع
DROP TRIGGER IF EXISTS trigger_notify_distribution_created ON distribution_details;
CREATE TRIGGER trigger_notify_distribution_created
  AFTER INSERT ON distribution_details
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_distribution_created();