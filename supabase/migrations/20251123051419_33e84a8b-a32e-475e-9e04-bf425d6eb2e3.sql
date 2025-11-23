-- ========================================
-- المرحلة 6: استكمال إدارة العقارات والإيجارات
-- ========================================

-- 1. جدول تذكيرات الدفع
CREATE TABLE IF NOT EXISTS public.payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_payment_id UUID NOT NULL REFERENCES public.rental_payments(id) ON DELETE CASCADE,
  
  -- معلومات التذكير
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('قبل الاستحقاق', 'يوم الاستحقاق', 'بعد التأخر', 'إشعار نهائي')),
  reminder_date DATE NOT NULL,
  days_before_due INTEGER,
  
  -- حالة الإرسال
  status TEXT NOT NULL DEFAULT 'معلق' CHECK (status IN ('معلق', 'تم الإرسال', 'فشل', 'تم القراءة')),
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  
  -- معلومات الإرسال
  send_method TEXT[] DEFAULT ARRAY['email', 'sms', 'notification'],
  recipient_email TEXT,
  recipient_phone TEXT,
  
  -- المحتوى
  subject TEXT,
  message_body TEXT,
  
  -- معلومات إضافية
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. جدول جداول الصيانة الدورية
CREATE TABLE IF NOT EXISTS public.maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_unit_id UUID REFERENCES public.property_units(id) ON DELETE CASCADE,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  
  -- معلومات الجدولة
  schedule_name TEXT NOT NULL,
  maintenance_type TEXT NOT NULL CHECK (maintenance_type IN ('دورية', 'وقائية', 'موسمية', 'سنوية')),
  category TEXT NOT NULL CHECK (category IN ('كهرباء', 'سباكة', 'تكييف', 'نظافة', 'طلاء', 'أخرى')),
  
  -- التكرار
  frequency TEXT NOT NULL CHECK (frequency IN ('يومية', 'أسبوعية', 'شهرية', 'ربع سنوية', 'نصف سنوية', 'سنوية')),
  frequency_value INTEGER NOT NULL DEFAULT 1, -- كل كم من الفترة
  
  -- التواريخ
  start_date DATE NOT NULL,
  end_date DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE NOT NULL,
  
  -- التكاليف
  estimated_cost NUMERIC DEFAULT 0,
  average_actual_cost NUMERIC DEFAULT 0,
  
  -- التعيين
  assigned_contractor TEXT,
  contractor_phone TEXT,
  
  -- الحالة والأولوية
  is_active BOOLEAN DEFAULT true,
  priority TEXT DEFAULT 'متوسطة' CHECK (priority IN ('عاجلة', 'عالية', 'متوسطة', 'منخفضة')),
  
  -- معلومات إضافية
  description TEXT,
  notes TEXT,
  checklist JSONB, -- قائمة الفحص
  
  -- إحصائيات
  total_maintenances INTEGER DEFAULT 0,
  total_cost NUMERIC DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. جدول سجل الصيانة الدورية
CREATE TABLE IF NOT EXISTS public.maintenance_schedule_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID NOT NULL REFERENCES public.maintenance_schedules(id) ON DELETE CASCADE,
  maintenance_request_id UUID REFERENCES public.maintenance_requests(id) ON DELETE SET NULL,
  
  -- معلومات التنفيذ
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  
  -- الحالة
  status TEXT NOT NULL DEFAULT 'مجدولة' CHECK (status IN ('مجدولة', 'قيد التنفيذ', 'مكتملة', 'ملغية', 'مؤجلة')),
  
  -- التكاليف
  actual_cost NUMERIC,
  
  -- النتيجة
  completion_notes TEXT,
  issues_found TEXT,
  recommendations TEXT,
  
  -- التقييم
  quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================
-- الفهارس (Indexes)
-- ========================================

CREATE INDEX IF NOT EXISTS idx_payment_reminders_rental_payment ON public.payment_reminders(rental_payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_status ON public.payment_reminders(status);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_date ON public.payment_reminders(reminder_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_property ON public.maintenance_schedules(property_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_unit ON public.maintenance_schedules(property_unit_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_next_date ON public.maintenance_schedules(next_maintenance_date);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_active ON public.maintenance_schedules(is_active);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_log_schedule ON public.maintenance_schedule_log(schedule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedule_log_status ON public.maintenance_schedule_log(status);

-- ========================================
-- Functions & Triggers
-- ========================================

-- Function: تحديث next_maintenance_date تلقائياً
CREATE OR REPLACE FUNCTION update_next_maintenance_date()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_next_maintenance_date
  BEFORE INSERT OR UPDATE OF last_maintenance_date, frequency, frequency_value
  ON public.maintenance_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_next_maintenance_date();

-- Function: إنشاء تذكيرات تلقائية عند إنشاء دفعة إيجار
CREATE OR REPLACE FUNCTION create_automatic_payment_reminders()
RETURNS TRIGGER AS $$
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
    'عزيزنا المستأجر، دفعة الإيجار مستحقة اليوم بمبلغ ' || NEW.amount_due || ' ريال. يرجى السداد في أقرب وقت.'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_payment_reminders
  AFTER INSERT ON public.rental_payments
  FOR EACH ROW
  WHEN (NEW.status IN ('معلق', 'مستحق'))
  EXECUTE FUNCTION create_automatic_payment_reminders();

-- Function: تحديث updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_reminders_updated_at
  BEFORE UPDATE ON public.payment_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_maintenance_schedules_updated_at
  BEFORE UPDATE ON public.maintenance_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- RLS Policies
-- ========================================

ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_schedule_log ENABLE ROW LEVEL SECURITY;

-- payment_reminders policies
CREATE POLICY "الموظفون والمحاسبون يمكنهم قراءة التذكيرات"
  ON public.payment_reminders FOR SELECT
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'accountant') OR 
    has_role(auth.uid(), 'cashier')
  );

CREATE POLICY "النظام يمكنه إنشاء التذكيرات"
  ON public.payment_reminders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "الموظفون يمكنهم تحديث التذكيرات"
  ON public.payment_reminders FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'accountant')
  );

-- maintenance_schedules policies
CREATE POLICY "الجميع يمكنهم قراءة جداول الصيانة"
  ON public.maintenance_schedules FOR SELECT
  USING (true);

CREATE POLICY "المسؤولون يمكنهم إدارة جداول الصيانة"
  ON public.maintenance_schedules FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'accountant')
  );

-- maintenance_schedule_log policies
CREATE POLICY "الجميع يمكنهم قراءة سجل الصيانة"
  ON public.maintenance_schedule_log FOR SELECT
  USING (true);

CREATE POLICY "المسؤولون يمكنهم إدارة سجل الصيانة"
  ON public.maintenance_schedule_log FOR ALL
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'accountant')
  );

-- ========================================
-- Comments
-- ========================================

COMMENT ON TABLE public.payment_reminders IS 'تذكيرات دفع الإيجار التلقائية';
COMMENT ON TABLE public.maintenance_schedules IS 'جداول الصيانة الدورية للعقارات والوحدات';
COMMENT ON TABLE public.maintenance_schedule_log IS 'سجل تنفيذ الصيانة الدورية';