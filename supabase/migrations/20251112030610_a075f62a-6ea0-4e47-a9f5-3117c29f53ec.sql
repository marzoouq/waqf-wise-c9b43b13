-- =============================================
-- المرحلة الأولى: نظام إدارة العائلات والطلبات
-- =============================================

-- 1. تحديث جدول beneficiaries
-- =============================================
ALTER TABLE beneficiaries ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id);

-- 2. إنشاء جدول العائلات (families)
-- =============================================
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name TEXT NOT NULL,
  head_of_family_id UUID REFERENCES beneficiaries(id),
  tribe TEXT,
  total_members INTEGER DEFAULT 0,
  status TEXT DEFAULT 'نشط',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. إنشاء جدول أفراد العائلات (family_members)
-- =============================================
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id),
  relationship_to_head TEXT NOT NULL,
  priority_level INTEGER DEFAULT 1,
  is_dependent BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, beneficiary_id)
);

-- 4. إنشاء جدول أنواع الطلبات (request_types)
-- =============================================
CREATE TABLE IF NOT EXISTS request_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  requires_approval BOOLEAN DEFAULT true,
  sla_hours INTEGER DEFAULT 24,
  is_active BOOLEAN DEFAULT true,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. إنشاء جدول طلبات المستفيدين (beneficiary_requests)
-- =============================================
CREATE TABLE IF NOT EXISTS beneficiary_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id),
  request_type_id UUID NOT NULL REFERENCES request_types(id),
  status TEXT DEFAULT 'قيد المراجعة',
  priority TEXT DEFAULT 'عادية',
  amount DECIMAL(15,2),
  description TEXT NOT NULL,
  decision_notes TEXT,
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  approved_at TIMESTAMPTZ,
  sla_due_at TIMESTAMPTZ,
  is_overdue BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. إنشاء جدول مرفقات الطلبات (request_attachments)
-- =============================================
CREATE TABLE IF NOT EXISTS request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES beneficiary_requests(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 7. إنشاء جدول تعليقات الطلبات (request_comments)
-- =============================================
CREATE TABLE IF NOT EXISTS request_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES beneficiary_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- الدوال الذكية (Smart Functions)
-- =============================================

-- دالة 1: تحديث عدد أفراد العائلة تلقائياً
CREATE OR REPLACE FUNCTION update_family_members_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE families 
    SET total_members = total_members + 1 
    WHERE id = NEW.family_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE families 
    SET total_members = total_members - 1 
    WHERE id = OLD.family_id;
  END IF;
  RETURN NULL;
END;
$$;

-- دالة 2: توليد رقم الطلب التلقائي (REQ-YY-000001)
CREATE OR REPLACE FUNCTION generate_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  year_suffix TEXT;
  next_number INTEGER;
BEGIN
  year_suffix := TO_CHAR(CURRENT_DATE, 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 8) AS INTEGER)), 0) + 1
  INTO next_number
  FROM beneficiary_requests
  WHERE request_number LIKE 'REQ-' || year_suffix || '-%';
  
  NEW.request_number := 'REQ-' || year_suffix || '-' || LPAD(next_number::TEXT, 6, '0');
  RETURN NEW;
END;
$$;

-- دالة 3: حساب SLA تلقائياً
CREATE OR REPLACE FUNCTION calculate_request_sla()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sla_hours INTEGER;
BEGIN
  SELECT rt.sla_hours INTO sla_hours
  FROM request_types rt
  WHERE rt.id = NEW.request_type_id;
  
  NEW.sla_due_at := NEW.submitted_at + (sla_hours || ' hours')::INTERVAL;
  NEW.is_overdue := (NEW.status = 'قيد المراجعة' AND now() > NEW.sla_due_at);
  
  RETURN NEW;
END;
$$;

-- =============================================
-- Triggers
-- =============================================

-- Trigger: تحديث total_members تلقائياً
DROP TRIGGER IF EXISTS trg_update_family_members_count ON family_members;
CREATE TRIGGER trg_update_family_members_count
AFTER INSERT OR DELETE ON family_members
FOR EACH ROW EXECUTE FUNCTION update_family_members_count();

-- Trigger: توليد رقم الطلب تلقائياً
DROP TRIGGER IF EXISTS trg_generate_request_number ON beneficiary_requests;
CREATE TRIGGER trg_generate_request_number
BEFORE INSERT ON beneficiary_requests
FOR EACH ROW EXECUTE FUNCTION generate_request_number();

-- Trigger: حساب SLA تلقائياً
DROP TRIGGER IF EXISTS trg_calculate_request_sla ON beneficiary_requests;
CREATE TRIGGER trg_calculate_request_sla
BEFORE INSERT OR UPDATE ON beneficiary_requests
FOR EACH ROW EXECUTE FUNCTION calculate_request_sla();

-- Triggers: تحديث updated_at
DROP TRIGGER IF EXISTS update_families_updated_at ON families;
CREATE TRIGGER update_families_updated_at 
BEFORE UPDATE ON families 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_family_members_updated_at ON family_members;
CREATE TRIGGER update_family_members_updated_at 
BEFORE UPDATE ON family_members 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_beneficiary_requests_updated_at ON beneficiary_requests;
CREATE TRIGGER update_beneficiary_requests_updated_at 
BEFORE UPDATE ON beneficiary_requests 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Indexes للأداء
-- =============================================

-- Indexes للعائلات
CREATE INDEX IF NOT EXISTS idx_families_head_of_family ON families(head_of_family_id);
CREATE INDEX IF NOT EXISTS idx_families_status ON families(status);
CREATE INDEX IF NOT EXISTS idx_families_tribe ON families(tribe);

-- Indexes لأفراد العائلات
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_beneficiary_id ON family_members(beneficiary_id);

-- Indexes للطلبات
CREATE INDEX IF NOT EXISTS idx_requests_beneficiary ON beneficiary_requests(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_requests_type ON beneficiary_requests(request_type_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON beneficiary_requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON beneficiary_requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_submitted ON beneficiary_requests(submitted_at);
CREATE INDEX IF NOT EXISTS idx_requests_sla_due ON beneficiary_requests(sla_due_at);
CREATE INDEX IF NOT EXISTS idx_requests_overdue ON beneficiary_requests(is_overdue);

-- Indexes للمرفقات والتعليقات
CREATE INDEX IF NOT EXISTS idx_attachments_request ON request_attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_comments_request ON request_comments(request_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON request_comments(user_id);

-- =============================================
-- RLS Policies
-- =============================================

-- 1. Policies لـ families
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view families" ON families;
CREATE POLICY "Authenticated users can view families"
ON families FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert families" ON families;
CREATE POLICY "Admins can insert families"
ON families FOR INSERT TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update families" ON families;
CREATE POLICY "Admins can update families"
ON families FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete families" ON families;
CREATE POLICY "Admins can delete families"
ON families FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- 2. Policies لـ family_members
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view family members" ON family_members;
CREATE POLICY "Authenticated users can view family members"
ON family_members FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert family members" ON family_members;
CREATE POLICY "Admins can insert family members"
ON family_members FOR INSERT TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update family members" ON family_members;
CREATE POLICY "Admins can update family members"
ON family_members FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete family members" ON family_members;
CREATE POLICY "Admins can delete family members"
ON family_members FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- 3. Policies لـ request_types
ALTER TABLE request_types ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view request types" ON request_types;
CREATE POLICY "Authenticated users can view request types"
ON request_types FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admins can insert request types" ON request_types;
CREATE POLICY "Admins can insert request types"
ON request_types FOR INSERT TO authenticated 
WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update request types" ON request_types;
CREATE POLICY "Admins can update request types"
ON request_types FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- 4. Policies لـ beneficiary_requests
ALTER TABLE beneficiary_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view requests" ON beneficiary_requests;
CREATE POLICY "Authenticated users can view requests"
ON beneficiary_requests FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert requests" ON beneficiary_requests;
CREATE POLICY "Authenticated users can insert requests"
ON beneficiary_requests FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can update requests" ON beneficiary_requests;
CREATE POLICY "Admins can update requests"
ON beneficiary_requests FOR UPDATE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete requests" ON beneficiary_requests;
CREATE POLICY "Admins can delete requests"
ON beneficiary_requests FOR DELETE TO authenticated 
USING (has_role(auth.uid(), 'admin'));

-- 5. Policies لـ request_attachments
ALTER TABLE request_attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view attachments" ON request_attachments;
CREATE POLICY "Authenticated users can view attachments"
ON request_attachments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert attachments" ON request_attachments;
CREATE POLICY "Authenticated users can insert attachments"
ON request_attachments FOR INSERT TO authenticated WITH CHECK (true);

-- 6. Policies لـ request_comments
ALTER TABLE request_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view comments" ON request_comments;
CREATE POLICY "Authenticated users can view comments"
ON request_comments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments" ON request_comments;
CREATE POLICY "Authenticated users can insert comments"
ON request_comments FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- إدراج بيانات request_types النموذجية
-- =============================================

INSERT INTO request_types (name, description, requires_approval, sla_hours, icon, is_active) VALUES
('فزعة طارئة', 'طلب مساعدة مالية عاجلة', true, 4, 'AlertCircle', true),
('قرض', 'طلب قرض حسن', true, 48, 'DollarSign', true),
('تحديث بيانات', 'طلب تعديل المعلومات الشخصية', false, 24, 'Edit', true),
('إضافة مولود', 'إضافة مولود جديد للعائلة', true, 72, 'Baby', true),
('استقلالية زوجة', 'طلب استقلالية زوجة', true, 48, 'Home', true),
('شكوى', 'تقديم شكوى أو اقتراح', false, 48, 'MessageSquare', true),
('استفسار', 'استفسار عام', false, 12, 'HelpCircle', true)
ON CONFLICT (name) DO NOTHING;