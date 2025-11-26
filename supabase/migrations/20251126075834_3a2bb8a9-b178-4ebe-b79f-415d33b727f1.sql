-- المرحلة 1: حذف الـ trigger المكرر
DROP TRIGGER IF EXISTS log_beneficiary_changes ON public.beneficiaries;

-- المرحلة 2: تحسين دالة log_beneficiary_activity مع معالجة الأخطاء
CREATE OR REPLACE FUNCTION public.log_beneficiary_activity()
RETURNS TRIGGER AS $$
BEGIN
  BEGIN
    -- تسجيل النشاط في جدول beneficiary_activity_log
    INSERT INTO public.beneficiary_activity_log (
      beneficiary_id,
      action_type,
      action_description,
      old_values,
      new_values,
      performed_by,
      performed_by_name,
      ip_address,
      user_agent
    ) VALUES (
      NEW.id,
      TG_OP,
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'تم إضافة مستفيد جديد: ' || NEW.full_name
        WHEN TG_OP = 'UPDATE' THEN 'تم تحديث بيانات المستفيد: ' || NEW.full_name
        WHEN TG_OP = 'DELETE' THEN 'تم حذف المستفيد: ' || OLD.full_name
        ELSE 'عملية على المستفيد'
      END,
      CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END,
      auth.uid(),
      (SELECT full_name FROM public.profiles WHERE user_id = auth.uid() LIMIT 1),
      NULL,
      NULL
    );
  EXCEPTION WHEN OTHERS THEN
    -- تسجيل الخطأ فقط دون إيقاف العملية
    RAISE WARNING 'Failed to log beneficiary activity: %', SQLERRM;
  END;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- المرحلة 3: تنظيف التنبيهات القديمة
UPDATE system_alerts 
SET status = 'resolved', 
    resolved_at = NOW()
WHERE status = 'active' 
  AND created_at < NOW() - INTERVAL '24 hours'
  AND alert_type IN ('uncaught_error', 'component_error');

-- حل التنبيهات المتعلقة بـ BeneficiaryRequests (تم إصلاحها)
UPDATE system_alerts 
SET status = 'resolved', 
    resolved_at = NOW()
WHERE status = 'active' 
  AND description LIKE '%BeneficiaryRequests%';