-- ============================================
-- نظام الدعم الفني المتكامل
-- ============================================

-- جدول التذاكر الرئيسي
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('technical', 'financial', 'account', 'request', 'complaint', 'inquiry', 'other')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed', 'cancelled')),
  
  assigned_to UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  sla_due_at TIMESTAMPTZ,
  is_overdue BOOLEAN DEFAULT false,
  
  source TEXT NOT NULL DEFAULT 'portal' CHECK (source IN ('portal', 'email', 'phone', 'chatbot')),
  tags TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  
  response_count INTEGER DEFAULT 0,
  reopened_count INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ DEFAULT now()
);

-- جدول التعليقات والردود
CREATE TABLE IF NOT EXISTS support_ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  is_solution BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}'::jsonb
);

-- جدول المرفقات
CREATE TABLE IF NOT EXISTS support_ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES support_ticket_comments(id) ON DELETE CASCADE,
  
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type TEXT,
  
  uploaded_by UUID REFERENCES auth.users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- جدول التقييمات
CREATE TABLE IF NOT EXISTS support_ticket_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  response_speed_rating INTEGER CHECK (response_speed_rating >= 1 AND response_speed_rating <= 5),
  solution_quality_rating INTEGER CHECK (solution_quality_rating >= 1 AND solution_quality_rating <= 5),
  staff_friendliness_rating INTEGER CHECK (staff_friendliness_rating >= 1 AND staff_friendliness_rating <= 5),
  
  rated_by UUID REFERENCES auth.users(id),
  rated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(ticket_id)
);

-- جدول سجل التغييرات
CREATE TABLE IF NOT EXISTS support_ticket_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  change_reason TEXT
);

-- قاعدة المعرفة - المقالات
CREATE TABLE IF NOT EXISTS kb_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category TEXT NOT NULL,
  tags TEXT[],
  
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false,
  
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  slug TEXT UNIQUE,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- قاعدة المعرفة - الأسئلة الشائعة
CREATE TABLE IF NOT EXISTS kb_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL,
  
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  views_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0
);

-- جدول إحصائيات الدعم
CREATE TABLE IF NOT EXISTS support_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  
  total_tickets INTEGER DEFAULT 0,
  new_tickets INTEGER DEFAULT 0,
  resolved_tickets INTEGER DEFAULT 0,
  closed_tickets INTEGER DEFAULT 0,
  reopened_tickets INTEGER DEFAULT 0,
  
  avg_first_response_minutes NUMERIC,
  avg_resolution_minutes NUMERIC,
  sla_compliance_rate NUMERIC,
  
  avg_rating NUMERIC,
  total_ratings INTEGER DEFAULT 0,
  
  active_agents INTEGER DEFAULT 0,
  total_responses INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- الفهارس لتحسين الأداء
-- ============================================

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_beneficiary_id ON support_tickets(beneficiary_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_category ON support_tickets(category);
CREATE INDEX idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX idx_support_tickets_is_overdue ON support_tickets(is_overdue) WHERE is_overdue = true;

CREATE INDEX idx_ticket_comments_ticket_id ON support_ticket_comments(ticket_id);
CREATE INDEX idx_ticket_comments_created_at ON support_ticket_comments(created_at);

CREATE INDEX idx_kb_articles_status ON kb_articles(status);
CREATE INDEX idx_kb_articles_category ON kb_articles(category);
CREATE INDEX idx_kb_articles_is_featured ON kb_articles(is_featured) WHERE is_featured = true;
CREATE INDEX idx_kb_articles_published_at ON kb_articles(published_at DESC);

CREATE INDEX idx_kb_faqs_category ON kb_faqs(category);
CREATE INDEX idx_kb_faqs_is_active ON kb_faqs(is_active) WHERE is_active = true;

-- ============================================
-- Triggers
-- ============================================

-- توليد رقم تذكرة تلقائي
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
  year_suffix TEXT;
  next_number INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 9) AS INTEGER)), 0) + 1
  INTO next_number
  FROM support_tickets
  WHERE ticket_number LIKE 'TKT-' || year_suffix || '-%';
  
  NEW.ticket_number := 'TKT-' || year_suffix || '-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_ticket_number
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  WHEN (NEW.ticket_number IS NULL)
  EXECUTE FUNCTION generate_ticket_number();

-- تحديث عداد الردود
CREATE OR REPLACE FUNCTION update_ticket_response_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE support_tickets
    SET response_count = response_count + 1,
        last_activity_at = now()
    WHERE id = NEW.ticket_id;
    
    -- تحديث وقت أول رد إذا لم يكن موجوداً
    UPDATE support_tickets
    SET first_response_at = now()
    WHERE id = NEW.ticket_id
      AND first_response_at IS NULL
      AND NEW.user_id != (SELECT user_id FROM support_tickets WHERE id = NEW.ticket_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_response_count
  AFTER INSERT ON support_ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_ticket_response_count();

-- تحديث timestamp
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_ticket_comments_updated_at
  BEFORE UPDATE ON support_ticket_comments
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_kb_articles_updated_at
  BEFORE UPDATE ON kb_articles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER update_kb_faqs_updated_at
  BEFORE UPDATE ON kb_faqs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- تسجيل التغييرات
CREATE OR REPLACE FUNCTION log_ticket_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- تسجيل تغيير الحالة
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO support_ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
      VALUES (NEW.id, auth.uid(), 'status', OLD.status, NEW.status);
    END IF;
    
    -- تسجيل تغيير الأولوية
    IF OLD.priority IS DISTINCT FROM NEW.priority THEN
      INSERT INTO support_ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
      VALUES (NEW.id, auth.uid(), 'priority', OLD.priority, NEW.priority);
    END IF;
    
    -- تسجيل تغيير التعيين
    IF OLD.assigned_to IS DISTINCT FROM NEW.assigned_to THEN
      INSERT INTO support_ticket_history (ticket_id, changed_by, field_name, old_value, new_value)
      VALUES (NEW.id, auth.uid(), 'assigned_to', OLD.assigned_to::TEXT, NEW.assigned_to::TEXT);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER log_ticket_changes_trigger
  AFTER UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION log_ticket_changes();

-- ============================================
-- RLS Policies
-- ============================================

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kb_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_statistics ENABLE ROW LEVEL SECURITY;

-- Policies للتذاكر
CREATE POLICY "المستخدمون يمكنهم رؤية تذاكرهم"
  ON support_tickets FOR SELECT
  USING (
    user_id = auth.uid() OR
    beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nazer'::app_role)
  );

CREATE POLICY "المستخدمون يمكنهم إنشاء تذاكر"
  ON support_tickets FOR INSERT
  WITH CHECK (user_id = auth.uid() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid()));

CREATE POLICY "المسؤولون يمكنهم تحديث التذاكر"
  ON support_tickets FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nazer'::app_role));

-- Policies للتعليقات
CREATE POLICY "المستخدمون يمكنهم رؤية تعليقات تذاكرهم"
  ON support_ticket_comments FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE user_id = auth.uid() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
    ) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nazer'::app_role)
  );

CREATE POLICY "المستخدمون يمكنهم إضافة تعليقات"
  ON support_ticket_comments FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE user_id = auth.uid() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
    ) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nazer'::app_role)
  );

-- Policies للمرفقات
CREATE POLICY "المستخدمون يمكنهم رؤية مرفقات تذاكرهم"
  ON support_ticket_attachments FOR SELECT
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE user_id = auth.uid() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
    ) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nazer'::app_role)
  );

CREATE POLICY "المستخدمون يمكنهم إضافة مرفقات"
  ON support_ticket_attachments FOR INSERT
  WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE user_id = auth.uid() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
    ) OR
    has_role(auth.uid(), 'admin'::app_role) OR
    has_role(auth.uid(), 'nazer'::app_role)
  );

-- Policies للتقييمات
CREATE POLICY "المستخدمون يمكنهم تقييم تذاكرهم"
  ON support_ticket_ratings FOR ALL
  USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE user_id = auth.uid() OR beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
    )
  );

-- Policies للسجل
CREATE POLICY "الجميع يمكنهم رؤية السجل"
  ON support_ticket_history FOR SELECT
  USING (true);

-- Policies لقاعدة المعرفة
CREATE POLICY "الجميع يمكنهم رؤية المقالات المنشورة"
  ON kb_articles FOR SELECT
  USING (status = 'published' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون يمكنهم إدارة المقالات"
  ON kb_articles FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "الجميع يمكنهم رؤية الأسئلة الشائعة النشطة"
  ON kb_faqs FOR SELECT
  USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون يمكنهم إدارة الأسئلة الشائعة"
  ON kb_faqs FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Policies للإحصائيات
CREATE POLICY "المسؤولون يمكنهم رؤية الإحصائيات"
  ON support_statistics FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nazer'::app_role));