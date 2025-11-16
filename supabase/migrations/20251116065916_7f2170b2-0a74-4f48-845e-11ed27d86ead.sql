-- إضافة جداول نظام التعيين والإشعارات للدعم الفني

-- جدول إعدادات التعيين التلقائي
CREATE TABLE IF NOT EXISTS support_assignment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_type TEXT NOT NULL DEFAULT 'round_robin', -- round_robin, load_balanced, skill_based
  auto_assign BOOLEAN DEFAULT true,
  max_tickets_per_agent INTEGER DEFAULT 10,
  consider_availability BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول توافر الموظفين
CREATE TABLE IF NOT EXISTS support_agent_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  current_load INTEGER DEFAULT 0,
  max_capacity INTEGER DEFAULT 10,
  skills TEXT[], -- مهارات الموظف (technical, financial, account, etc.)
  priority_level INTEGER DEFAULT 1, -- أولوية التعيين
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- جدول إحصائيات أداء الموظفين
CREATE TABLE IF NOT EXISTS support_agent_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  total_assigned INTEGER DEFAULT 0,
  total_resolved INTEGER DEFAULT 0,
  total_closed INTEGER DEFAULT 0,
  avg_response_minutes NUMERIC,
  avg_resolution_minutes NUMERIC,
  customer_satisfaction_avg NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- جدول سجل التصعيد
CREATE TABLE IF NOT EXISTS support_escalations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  escalated_from UUID REFERENCES auth.users(id),
  escalated_to UUID REFERENCES auth.users(id),
  escalation_reason TEXT NOT NULL,
  escalation_level INTEGER DEFAULT 1, -- مستوى التصعيد
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول قوالب الإشعارات
CREATE TABLE IF NOT EXISTS support_notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key TEXT UNIQUE NOT NULL,
  title_ar TEXT NOT NULL,
  message_ar TEXT NOT NULL,
  notification_type TEXT DEFAULT 'info', -- info, warning, error, success
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- إضافة أعمدة للتذاكر
ALTER TABLE support_tickets 
ADD COLUMN IF NOT EXISTS auto_assigned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS escalation_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_escalated_at TIMESTAMPTZ;

-- Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_agent_availability_user ON support_agent_availability(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_stats_user_date ON support_agent_stats(user_id, date);
CREATE INDEX IF NOT EXISTS idx_escalations_ticket ON support_escalations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_status ON support_tickets(assigned_to, status);

-- Function: التعيين التلقائي للتذاكر
CREATE OR REPLACE FUNCTION auto_assign_ticket()
RETURNS TRIGGER AS $$
DECLARE
  v_agent_id UUID;
  v_assignment_type TEXT;
  v_auto_assign BOOLEAN;
BEGIN
  -- التحقق من تفعيل التعيين التلقائي
  SELECT auto_assign, assignment_type INTO v_auto_assign, v_assignment_type
  FROM support_assignment_settings
  LIMIT 1;
  
  IF NOT v_auto_assign OR NEW.assigned_to IS NOT NULL THEN
    RETURN NEW;
  END IF;
  
  -- اختيار الموظف بناءً على النوع
  IF v_assignment_type = 'round_robin' THEN
    -- التعيين بالتناوب
    SELECT user_id INTO v_agent_id
    FROM support_agent_availability
    WHERE is_available = true 
      AND current_load < max_capacity
    ORDER BY current_load ASC, priority_level DESC, RANDOM()
    LIMIT 1;
    
  ELSIF v_assignment_type = 'load_balanced' THEN
    -- التعيين المتوازن
    SELECT user_id INTO v_agent_id
    FROM support_agent_availability
    WHERE is_available = true 
      AND current_load < max_capacity
    ORDER BY (current_load::FLOAT / NULLIF(max_capacity, 0)) ASC, priority_level DESC
    LIMIT 1;
    
  ELSIF v_assignment_type = 'skill_based' THEN
    -- التعيين بناءً على المهارات
    SELECT user_id INTO v_agent_id
    FROM support_agent_availability
    WHERE is_available = true 
      AND current_load < max_capacity
      AND NEW.category = ANY(skills)
    ORDER BY current_load ASC, priority_level DESC
    LIMIT 1;
    
    -- إذا لم يوجد موظف بالمهارة المطلوبة، استخدم التعيين المتوازن
    IF v_agent_id IS NULL THEN
      SELECT user_id INTO v_agent_id
      FROM support_agent_availability
      WHERE is_available = true AND current_load < max_capacity
      ORDER BY current_load ASC
      LIMIT 1;
    END IF;
  END IF;
  
  IF v_agent_id IS NOT NULL THEN
    NEW.assigned_to := v_agent_id;
    NEW.assigned_at := now();
    NEW.auto_assigned := true;
    
    -- تحديث عداد الموظف
    UPDATE support_agent_availability
    SET current_load = current_load + 1,
        updated_at = now()
    WHERE user_id = v_agent_id;
    
    -- تحديث إحصائيات اليوم
    INSERT INTO support_agent_stats (user_id, date, total_assigned)
    VALUES (v_agent_id, CURRENT_DATE, 1)
    ON CONFLICT (user_id, date) 
    DO UPDATE SET total_assigned = support_agent_stats.total_assigned + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: تحديث إحصائيات الموظف عند تغيير حالة التذكرة
CREATE OR REPLACE FUNCTION update_agent_stats_on_ticket_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' THEN
    -- تحديث عدد التذاكر المحلولة
    UPDATE support_agent_stats
    SET total_resolved = total_resolved + 1
    WHERE user_id = NEW.assigned_to AND date = CURRENT_DATE;
    
    -- تقليل الحمل
    UPDATE support_agent_availability
    SET current_load = GREATEST(0, current_load - 1)
    WHERE user_id = NEW.assigned_to;
    
  ELSIF NEW.status = 'closed' AND OLD.status != 'closed' THEN
    -- تحديث عدد التذاكر المغلقة
    UPDATE support_agent_stats
    SET total_closed = total_closed + 1
    WHERE user_id = NEW.assigned_to AND date = CURRENT_DATE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: التصعيد التلقائي للتذاكر المتأخرة
CREATE OR REPLACE FUNCTION auto_escalate_overdue_tickets()
RETURNS void AS $$
DECLARE
  v_ticket RECORD;
  v_supervisor_id UUID;
BEGIN
  FOR v_ticket IN
    SELECT id, assigned_to, ticket_number, subject, sla_due_at
    FROM support_tickets
    WHERE status IN ('open', 'in_progress')
      AND is_overdue = true
      AND escalation_count < 3
      AND (last_escalated_at IS NULL OR last_escalated_at < now() - INTERVAL '24 hours')
  LOOP
    -- البحث عن مشرف متاح
    SELECT user_id INTO v_supervisor_id
    FROM support_agent_availability
    WHERE is_available = true 
      AND priority_level > 5
      AND current_load < max_capacity
    ORDER BY current_load ASC
    LIMIT 1;
    
    IF v_supervisor_id IS NOT NULL THEN
      -- تسجيل التصعيد
      INSERT INTO support_escalations (
        ticket_id, escalated_from, escalated_to, 
        escalation_reason, escalation_level
      ) VALUES (
        v_ticket.id, v_ticket.assigned_to, v_supervisor_id,
        'تذكرة متأخرة تجاوزت وقت SLA',
        (SELECT escalation_count + 1 FROM support_tickets WHERE id = v_ticket.id)
      );
      
      -- تحديث التذكرة
      UPDATE support_tickets
      SET assigned_to = v_supervisor_id,
          escalation_count = escalation_count + 1,
          last_escalated_at = now(),
          priority = 'urgent'
      WHERE id = v_ticket.id;
      
      -- إنشاء تعليق تلقائي
      INSERT INTO support_ticket_comments (
        ticket_id, user_id, comment, is_internal
      ) VALUES (
        v_ticket.id, v_supervisor_id,
        'تم تصعيد التذكرة تلقائياً بسبب تجاوز وقت SLA',
        true
      );
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
DROP TRIGGER IF EXISTS trigger_auto_assign_ticket ON support_tickets;
CREATE TRIGGER trigger_auto_assign_ticket
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_ticket();

DROP TRIGGER IF EXISTS trigger_update_agent_stats ON support_tickets;
CREATE TRIGGER trigger_update_agent_stats
  AFTER UPDATE ON support_tickets
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_agent_stats_on_ticket_change();

-- إضافة قوالب الإشعارات الافتراضية
INSERT INTO support_notification_templates (template_key, title_ar, message_ar, notification_type) VALUES
('ticket_assigned', 'تذكرة جديدة', 'تم تعيين تذكرة #{ticket_number} إليك', 'info'),
('ticket_escalated', 'تصعيد تذكرة', 'تم تصعيد التذكرة #{ticket_number} إليك', 'warning'),
('new_comment', 'رد جديد', 'رد جديد على التذكرة #{ticket_number}', 'info'),
('ticket_resolved', 'تم الحل', 'تم حل التذكرة #{ticket_number}', 'success'),
('ticket_overdue', 'تذكرة متأخرة', 'التذكرة #{ticket_number} متأخرة عن موعد SLA', 'error')
ON CONFLICT (template_key) DO NOTHING;

-- إضافة إعدادات افتراضية
INSERT INTO support_assignment_settings (assignment_type, auto_assign, max_tickets_per_agent)
VALUES ('load_balanced', true, 10)
ON CONFLICT DO NOTHING;

-- تفعيل RLS
ALTER TABLE support_assignment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_agent_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_agent_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admin can manage assignment settings"
  ON support_assignment_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  ));

CREATE POLICY "Agents can view their availability"
  ON support_agent_availability FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  ));

CREATE POLICY "Agents can update their availability"
  ON support_agent_availability FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admin can manage agent availability"
  ON support_agent_availability FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  ));

CREATE POLICY "Users can view their stats"
  ON support_agent_stats FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  ));

CREATE POLICY "Users can view escalations"
  ON support_escalations FOR SELECT
  USING (escalated_from = auth.uid() OR escalated_to = auth.uid() OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  ));

CREATE POLICY "Everyone can view templates"
  ON support_notification_templates FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin can manage templates"
  ON support_notification_templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role IN ('admin', 'nazer')
  ));

-- تفعيل Realtime للتذاكر والتعليقات
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE support_ticket_comments;