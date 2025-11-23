-- إصلاح نهائي للدوال بدون search_path

-- 1. إصلاح update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. إصلاح update_next_maintenance_date
CREATE OR REPLACE FUNCTION public.update_next_maintenance_date()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- حساب التاريخ التالي بناءً على frequency
  CASE NEW.frequency
    WHEN 'يومية' THEN
      NEW.next_maintenance_date := COALESCE(NEW.last_maintenance_date, NEW.start_date) + (NEW.frequency_value || ' days')::INTERVAL;
    WHEN 'أسبوعية' THEN
      NEW.next_maintenance_date := COALESCE(NEW.last_maintenance_date, NEW.start_date) + (NEW.frequency_value || ' weeks')::INTERVAL;
    WHEN 'شهرية' THEN
      NEW.next_maintenance_date := COALESCE(NEW.last_maintenance_date, NEW.start_date) + (NEW.frequency_value || ' months')::INTERVAL;
    WHEN 'ربع سنوية' THEN
      NEW.next_maintenance_date := COALESCE(NEW.last_maintenance_date, NEW.start_date) + (NEW.frequency_value * 3 || ' months')::INTERVAL;
    WHEN 'نصف سنوية' THEN
      NEW.next_maintenance_date := COALESCE(NEW.last_maintenance_date, NEW.start_date) + (NEW.frequency_value * 6 || ' months')::INTERVAL;
    WHEN 'سنوية' THEN
      NEW.next_maintenance_date := COALESCE(NEW.last_maintenance_date, NEW.start_date) + (NEW.frequency_value || ' years')::INTERVAL;
  END CASE;
  
  RETURN NEW;
END;
$$;

-- 3. إصلاح create_automatic_payment_reminders
CREATE OR REPLACE FUNCTION public.create_automatic_payment_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  -- تذكير قبل 7 أيام
  INSERT INTO public.payment_reminders (
    rental_payment_id, 
    reminder_type, 
    reminder_date, 
    days_before_due,
    subject,
    message_body
  ) VALUES (
    NEW.id,
    'قبل الاستحقاق',
    NEW.due_date - INTERVAL '7 days',
    7,
    'تذكير: دفعة إيجار قادمة',
    'عزيزنا المستأجر، نذكركم بأن لديكم دفعة إيجار مستحقة بتاريخ ' || NEW.due_date || ' بمبلغ ' || NEW.amount_due || ' ريال.'
  );
  
  -- تذكير يوم الاستحقاق
  INSERT INTO public.payment_reminders (
    rental_payment_id,
    reminder_type,
    reminder_date,
    days_before_due,
    subject,
    message_body
  ) VALUES (
    NEW.id,
    'يوم الاستحقاق',
    NEW.due_date,
    0,
    'تنبيه: دفعة إيجار مستحقة اليوم',
    'عزيزنا المستأجر، دفعة الإيجار مستحقة اليوم بمبلغ ' || NEW.amount_due || ' ريال.'
  );
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column IS 'تحديث updated_at تلقائياً مع search_path آمن';
COMMENT ON FUNCTION public.update_next_maintenance_date IS 'حساب تاريخ الصيانة التالي مع search_path آمن';
COMMENT ON FUNCTION public.create_automatic_payment_reminders IS 'إنشاء تذكيرات دفع تلقائية مع search_path آمن';
