-- ========================================
-- المرحلة 1: الوحدات العقارية
-- ========================================

-- جدول الوحدات العقارية
CREATE TABLE IF NOT EXISTS property_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  
  -- معلومات الوحدة
  unit_number TEXT NOT NULL,
  unit_name TEXT,
  unit_type TEXT NOT NULL,
  floor_number INTEGER,
  
  -- المواصفات
  area NUMERIC(10,2),
  rooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  has_kitchen BOOLEAN DEFAULT FALSE,
  has_parking BOOLEAN DEFAULT FALSE,
  parking_spaces INTEGER DEFAULT 0,
  
  -- الإيجار والعائد
  monthly_rent NUMERIC(10,2),
  annual_rent NUMERIC(10,2) GENERATED ALWAYS AS (monthly_rent * 12) STORED,
  estimated_value NUMERIC(12,2),
  
  -- الحالة
  status TEXT DEFAULT 'متاح',
  occupancy_status TEXT DEFAULT 'شاغر',
  
  -- المستأجر الحالي
  current_tenant_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  current_contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
  lease_start_date DATE,
  lease_end_date DATE,
  
  -- المواصفات الإضافية
  amenities JSONB,
  utilities_included TEXT[],
  furnishing_status TEXT,
  
  -- معلومات إضافية
  description TEXT,
  notes TEXT,
  images TEXT[],
  
  -- التواريخ
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  
  -- التتبع
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- الفهارس
CREATE INDEX IF NOT EXISTS idx_property_units_property_id ON property_units(property_id);
CREATE INDEX IF NOT EXISTS idx_property_units_status ON property_units(status);
CREATE INDEX IF NOT EXISTS idx_property_units_tenant ON property_units(current_tenant_id);

-- Trigger للتحديث التلقائي
CREATE TRIGGER update_property_units_updated_at
  BEFORE UPDATE ON property_units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- تحديث جدول Properties لإضافة حقول الوحدات
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS total_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS occupied_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS available_units INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS occupancy_percentage NUMERIC(5,2) GENERATED ALWAYS AS 
  (CASE WHEN total_units > 0 THEN (occupied_units::NUMERIC / total_units * 100) ELSE 0 END) STORED;

-- دالة لتحديث عدد الوحدات تلقائياً
CREATE OR REPLACE FUNCTION update_property_units_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE properties
    SET 
      total_units = (SELECT COUNT(*) FROM property_units WHERE property_id = OLD.property_id),
      occupied_units = (SELECT COUNT(*) FROM property_units WHERE property_id = OLD.property_id AND occupancy_status = 'مشغول'),
      available_units = (SELECT COUNT(*) FROM property_units WHERE property_id = OLD.property_id AND status = 'متاح')
    WHERE id = OLD.property_id;
    RETURN OLD;
  ELSE
    UPDATE properties
    SET 
      total_units = (SELECT COUNT(*) FROM property_units WHERE property_id = NEW.property_id),
      occupied_units = (SELECT COUNT(*) FROM property_units WHERE property_id = NEW.property_id AND occupancy_status = 'مشغول'),
      available_units = (SELECT COUNT(*) FROM property_units WHERE property_id = NEW.property_id AND status = 'متاح')
    WHERE id = NEW.property_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger للتحديث التلقائي
DROP TRIGGER IF EXISTS update_property_units_count_trigger ON property_units;
CREATE TRIGGER update_property_units_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON property_units
FOR EACH ROW
EXECUTE FUNCTION update_property_units_count();

-- RLS
ALTER TABLE property_units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الجميع يمكنهم قراءة الوحدات"
ON property_units FOR SELECT
USING (true);

CREATE POLICY "المسؤولون يمكنهم إدارة الوحدات"
ON property_units FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

-- ========================================
-- المرحلة 2: نظام الحوكمة - الإعدادات
-- ========================================

-- تحديث جدول organization_settings
ALTER TABLE organization_settings 
ADD COLUMN IF NOT EXISTS governance_type TEXT DEFAULT 'nazer_only' 
  CHECK (governance_type IN ('nazer_only', 'nazer_with_board')),
ADD COLUMN IF NOT EXISTS nazer_name TEXT,
ADD COLUMN IF NOT EXISTS nazer_title TEXT,
ADD COLUMN IF NOT EXISTS nazer_appointment_date DATE,
ADD COLUMN IF NOT EXISTS nazer_contact_phone TEXT,
ADD COLUMN IF NOT EXISTS nazer_contact_email TEXT,
ADD COLUMN IF NOT EXISTS waqf_type TEXT,
ADD COLUMN IF NOT EXISTS waqf_establishment_date DATE,
ADD COLUMN IF NOT EXISTS waqf_registration_number TEXT,
ADD COLUMN IF NOT EXISTS waqf_deed_url TEXT;

COMMENT ON COLUMN organization_settings.governance_type IS 'نوع إدارة الوقف: nazer_only (ناظر فقط) أو nazer_with_board (ناظر + مجلس)';

-- جدول النظار الإضافيين
CREATE TABLE IF NOT EXISTS waqf_nazers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nazer_name TEXT NOT NULL,
  nazer_title TEXT,
  national_id TEXT,
  appointment_date DATE NOT NULL,
  appointment_decree TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  contact_phone TEXT,
  contact_email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_waqf_nazers_updated_at
  BEFORE UPDATE ON waqf_nazers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE waqf_nazers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الجميع يمكنهم قراءة النظار"
ON waqf_nazers FOR SELECT
USING (true);

CREATE POLICY "المسؤولون يمكنهم إدارة النظار"
ON waqf_nazers FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

-- ========================================
-- المرحلة 3: السياسات واللوائح
-- ========================================

CREATE TABLE IF NOT EXISTS governance_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_code TEXT UNIQUE NOT NULL,
  policy_name_ar TEXT NOT NULL,
  policy_name_en TEXT,
  category TEXT NOT NULL,
  policy_type TEXT NOT NULL,
  
  description TEXT,
  objectives TEXT,
  scope TEXT,
  policy_document_url TEXT,
  
  waqf_conditions JSONB,
  distribution_rules JSONB,
  beneficiary_eligibility JSONB,
  
  effective_date DATE NOT NULL,
  review_date DATE,
  expiry_date DATE,
  
  status TEXT DEFAULT 'مسودة',
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  approval_notes TEXT,
  
  version INTEGER DEFAULT 1,
  parent_policy_id UUID REFERENCES governance_policies(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS policy_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID REFERENCES governance_policies(id) ON DELETE CASCADE,
  review_date DATE NOT NULL,
  reviewer_name TEXT NOT NULL,
  review_type TEXT,
  findings TEXT,
  recommendations TEXT,
  action_required BOOLEAN DEFAULT FALSE,
  next_review_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_governance_policies_updated_at
  BEFORE UPDATE ON governance_policies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE governance_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الجميع يمكنهم قراءة السياسات المعتمدة"
ON governance_policies FOR SELECT
USING (
  status = 'معتمد' OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

CREATE POLICY "المسؤولون يمكنهم إدارة السياسات"
ON governance_policies FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

-- ========================================
-- المرحلة 4: المجالس واللجان
-- ========================================

CREATE TABLE IF NOT EXISTS governance_boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_code TEXT UNIQUE NOT NULL,
  board_name_ar TEXT NOT NULL,
  board_type TEXT NOT NULL,
  description TEXT,
  
  chairman_name TEXT NOT NULL,
  vice_chairman_name TEXT,
  secretary_name TEXT,
  
  meeting_frequency TEXT,
  quorum_requirement INTEGER,
  voting_rules JSONB,
  
  responsibilities TEXT[],
  decision_authority TEXT,
  
  status TEXT DEFAULT 'نشط',
  established_date DATE,
  dissolution_date DATE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governance_board_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES governance_boards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  member_name TEXT NOT NULL,
  member_title TEXT,
  position TEXT NOT NULL,
  membership_type TEXT NOT NULL,
  
  expertise_areas TEXT[],
  qualifications TEXT,
  
  join_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  
  voting_rights BOOLEAN DEFAULT TRUE,
  attendance_mandatory BOOLEAN DEFAULT TRUE,
  
  email TEXT,
  phone TEXT,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_governance_boards_updated_at
  BEFORE UPDATE ON governance_boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_governance_board_members_updated_at
  BEFORE UPDATE ON governance_board_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE governance_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_board_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الجميع يمكنهم قراءة المجالس النشطة"
ON governance_boards FOR SELECT
USING (status = 'نشط' OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "المسؤولون يمكنهم إدارة المجالس"
ON governance_boards FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

CREATE POLICY "الجميع يمكنهم قراءة الأعضاء"
ON governance_board_members FOR SELECT
USING (true);

CREATE POLICY "المسؤولون يمكنهم إدارة الأعضاء"
ON governance_board_members FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

-- ========================================
-- المرحلة 5: الاجتماعات
-- ========================================

CREATE TABLE IF NOT EXISTS governance_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID REFERENCES governance_boards(id) ON DELETE CASCADE,
  
  meeting_number TEXT NOT NULL,
  meeting_type TEXT NOT NULL,
  meeting_title TEXT NOT NULL,
  
  scheduled_date TIMESTAMPTZ NOT NULL,
  actual_start_time TIMESTAMPTZ,
  actual_end_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  
  location TEXT,
  virtual_link TEXT,
  is_virtual BOOLEAN DEFAULT FALSE,
  
  agenda JSONB NOT NULL,
  agenda_items_count INTEGER GENERATED ALWAYS AS (jsonb_array_length(agenda)) STORED,
  
  minutes TEXT,
  minutes_document_url TEXT,
  minutes_approved BOOLEAN DEFAULT FALSE,
  minutes_approved_at TIMESTAMPTZ,
  
  attendees_count INTEGER DEFAULT 0,
  quorum_met BOOLEAN DEFAULT FALSE,
  attendance_percentage NUMERIC(5,2),
  
  decisions_count INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'مجدول',
  cancellation_reason TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governance_meeting_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES governance_meetings(id) ON DELETE CASCADE,
  member_id UUID REFERENCES governance_board_members(id),
  member_name TEXT NOT NULL,
  
  attendance_status TEXT NOT NULL,
  arrival_time TIMESTAMPTZ,
  departure_time TIMESTAMPTZ,
  
  participated BOOLEAN DEFAULT TRUE,
  contribution_notes TEXT,
  
  excuse_reason TEXT,
  excuse_accepted BOOLEAN,
  
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_governance_meetings_updated_at
  BEFORE UPDATE ON governance_meetings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE governance_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_meeting_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الأعضاء يمكنهم رؤية اجتماعات مجالسهم"
ON governance_meetings FOR SELECT
USING (
  board_id IN (
    SELECT board_id FROM governance_board_members 
    WHERE user_id = auth.uid() AND is_active = TRUE
  )
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'nazer'::app_role)
);

CREATE POLICY "المسؤولون يمكنهم إدارة الاجتماعات"
ON governance_meetings FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

-- ========================================
-- المرحلة 6: القرارات والتصويت المرن
-- ========================================

CREATE TABLE IF NOT EXISTS governance_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID REFERENCES governance_meetings(id),
  board_id UUID REFERENCES governance_boards(id),
  
  decision_number TEXT NOT NULL UNIQUE,
  decision_date DATE NOT NULL,
  decision_title TEXT NOT NULL,
  decision_text TEXT NOT NULL,
  decision_type TEXT NOT NULL,
  
  requires_voting BOOLEAN DEFAULT TRUE,
  voting_participants_type TEXT NOT NULL DEFAULT 'board_only',
  custom_voters JSONB,
  
  voting_method TEXT DEFAULT 'رفع الأيدي',
  voting_quorum INTEGER,
  pass_threshold NUMERIC(5,2) DEFAULT 50.00,
  
  votes_for INTEGER DEFAULT 0,
  votes_against INTEGER DEFAULT 0,
  votes_abstain INTEGER DEFAULT 0,
  total_votes INTEGER GENERATED ALWAYS AS (votes_for + votes_against + votes_abstain) STORED,
  voting_completed BOOLEAN DEFAULT FALSE,
  
  decision_status TEXT DEFAULT 'قيد التصويت',
  
  implementation_deadline DATE,
  responsible_person_name TEXT,
  implementation_plan TEXT,
  implementation_progress INTEGER DEFAULT 0,
  implementation_notes TEXT,
  implemented_at TIMESTAMPTZ,
  
  attachments TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS governance_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES governance_decisions(id) ON DELETE CASCADE,
  
  voter_id UUID REFERENCES auth.users(id),
  voter_name TEXT NOT NULL,
  voter_type TEXT NOT NULL,
  
  beneficiary_id UUID REFERENCES beneficiaries(id),
  
  vote TEXT NOT NULL CHECK (vote IN ('موافق', 'معارض', 'ممتنع')),
  vote_reason TEXT,
  
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  
  is_secret BOOLEAN DEFAULT FALSE,
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(decision_id, voter_id)
);

CREATE TABLE IF NOT EXISTS voting_delegations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id UUID REFERENCES governance_decisions(id) ON DELETE CASCADE,
  
  delegator_id UUID REFERENCES auth.users(id),
  delegator_name TEXT NOT NULL,
  
  delegate_id UUID REFERENCES auth.users(id),
  delegate_name TEXT NOT NULL,
  
  delegation_reason TEXT,
  delegated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(decision_id, delegator_id)
);

CREATE INDEX IF NOT EXISTS idx_decisions_status ON governance_decisions(decision_status);
CREATE INDEX IF NOT EXISTS idx_decisions_voting_type ON governance_decisions(voting_participants_type);
CREATE INDEX IF NOT EXISTS idx_votes_decision ON governance_votes(decision_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter ON governance_votes(voter_id);

CREATE TRIGGER update_governance_decisions_updated_at
  BEFORE UPDATE ON governance_decisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- دالة لحساب نتائج التصويت تلقائياً
CREATE OR REPLACE FUNCTION update_decision_voting_results()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE governance_decisions
  SET 
    votes_for = (SELECT COUNT(*) FROM governance_votes WHERE decision_id = COALESCE(NEW.decision_id, OLD.decision_id) AND vote = 'موافق'),
    votes_against = (SELECT COUNT(*) FROM governance_votes WHERE decision_id = COALESCE(NEW.decision_id, OLD.decision_id) AND vote = 'معارض'),
    votes_abstain = (SELECT COUNT(*) FROM governance_votes WHERE decision_id = COALESCE(NEW.decision_id, OLD.decision_id) AND vote = 'ممتنع')
  WHERE id = COALESCE(NEW.decision_id, OLD.decision_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS update_voting_results_trigger ON governance_votes;
CREATE TRIGGER update_voting_results_trigger
AFTER INSERT OR UPDATE OR DELETE ON governance_votes
FOR EACH ROW
EXECUTE FUNCTION update_decision_voting_results();

ALTER TABLE governance_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE governance_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الجميع يمكنهم قراءة القرارات"
ON governance_decisions FOR SELECT
USING (true);

CREATE POLICY "المسؤولون يمكنهم إضافة قرارات"
ON governance_decisions FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  EXISTS (
    SELECT 1 FROM governance_board_members 
    WHERE user_id = auth.uid() AND is_active = TRUE
  )
);

CREATE POLICY "المسؤولون يمكنهم تعديل القرارات"
ON governance_decisions FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

CREATE POLICY "رؤية الأصوات حسب الصلاحية"
ON governance_votes FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR
  voter_id = auth.uid() OR
  (NOT is_secret AND EXISTS (
    SELECT 1 FROM governance_decisions 
    WHERE id = decision_id AND voting_completed = TRUE
  ))
);

CREATE POLICY "المصوتون المسموح لهم يمكنهم التصويت"
ON governance_votes FOR INSERT
WITH CHECK (
  voter_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM governance_decisions d
    WHERE d.id = decision_id
    AND d.voting_completed = FALSE
    AND (
      (d.voting_participants_type = 'board_only' AND EXISTS (
        SELECT 1 FROM governance_board_members 
        WHERE user_id = auth.uid() AND is_active = TRUE
      ))
      OR
      (d.voting_participants_type = 'first_class_beneficiaries' AND EXISTS (
        SELECT 1 FROM beneficiaries 
        WHERE user_id = auth.uid() AND category = 'الفئة الأولى'
      ))
      OR
      (d.voting_participants_type = 'board_and_beneficiaries' AND (
        EXISTS (
          SELECT 1 FROM governance_board_members 
          WHERE user_id = auth.uid() AND is_active = TRUE
        )
        OR EXISTS (
          SELECT 1 FROM beneficiaries 
          WHERE user_id = auth.uid() AND category = 'الفئة الأولى'
        )
      ))
      OR
      (d.voting_participants_type = 'custom' AND 
        jsonb_path_exists(d.custom_voters, ('$[*] ? (@.user_id == "' || auth.uid()::text || '")')::jsonpath)
      )
      OR
      has_role(auth.uid(), 'nazer'::app_role)
    )
  )
);

-- ========================================
-- المرحلة 7: الإفصاحات
-- ========================================

CREATE TABLE IF NOT EXISTS governance_disclosures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  disclosure_type TEXT NOT NULL,
  disclosure_category TEXT,
  
  disclosure_title TEXT NOT NULL,
  disclosure_summary TEXT,
  content TEXT NOT NULL,
  
  document_url TEXT,
  attachments TEXT[],
  
  disclosure_date DATE NOT NULL,
  reporting_period_start DATE,
  reporting_period_end DATE,
  
  target_audience TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  is_mandatory BOOLEAN DEFAULT FALSE,
  
  published_at TIMESTAMPTZ,
  publication_channels TEXT[],
  
  status TEXT DEFAULT 'مسودة',
  
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  
  related_decision_id UUID REFERENCES governance_decisions(id),
  related_policy_id UUID REFERENCES governance_policies(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_governance_disclosures_updated_at
  BEFORE UPDATE ON governance_disclosures
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE governance_disclosures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الجميع يمكنهم قراءة الإفصاحات العامة المنشورة"
ON governance_disclosures FOR SELECT
USING (
  (is_public = TRUE AND status = 'منشور')
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'nazer'::app_role)
);

CREATE POLICY "المسؤولون يمكنهم إدارة الإفصاحات"
ON governance_disclosures FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);

-- ========================================
-- المرحلة 8: إدارة المخاطر
-- ========================================

CREATE TABLE IF NOT EXISTS governance_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_code TEXT UNIQUE NOT NULL,
  risk_title TEXT NOT NULL,
  
  risk_category TEXT NOT NULL,
  risk_subcategory TEXT,
  
  risk_description TEXT NOT NULL,
  potential_impact TEXT,
  trigger_events TEXT[],
  
  likelihood TEXT NOT NULL,
  likelihood_score INTEGER CHECK (likelihood_score BETWEEN 1 AND 5),
  
  impact TEXT NOT NULL,
  impact_score INTEGER CHECK (impact_score BETWEEN 1 AND 5),
  
  risk_score INTEGER GENERATED ALWAYS AS (likelihood_score * impact_score) STORED,
  risk_level TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (likelihood_score * impact_score) <= 4 THEN 'منخفض'
      WHEN (likelihood_score * impact_score) <= 9 THEN 'متوسط'
      WHEN (likelihood_score * impact_score) <= 15 THEN 'عالي'
      ELSE 'حرج'
    END
  ) STORED,
  
  current_controls TEXT,
  control_effectiveness TEXT,
  mitigation_plan TEXT,
  mitigation_actions JSONB,
  residual_risk_score INTEGER,
  
  risk_owner_name TEXT NOT NULL,
  
  review_frequency TEXT NOT NULL,
  last_review_date DATE,
  next_review_date DATE NOT NULL,
  
  status TEXT DEFAULT 'نشط',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  risk_id UUID REFERENCES governance_risks(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  assessor_name TEXT NOT NULL,
  
  likelihood_score INTEGER,
  impact_score INTEGER,
  overall_score INTEGER,
  
  findings TEXT,
  recommendations TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_governance_risks_updated_at
  BEFORE UPDATE ON governance_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE governance_risks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "الأدوار الإدارية يمكنها قراءة المخاطر"
ON governance_risks FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role) OR 
  has_role(auth.uid(), 'accountant'::app_role)
);

CREATE POLICY "المسؤولون يمكنهم إدارة المخاطر"
ON governance_risks FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'nazer'::app_role)
);