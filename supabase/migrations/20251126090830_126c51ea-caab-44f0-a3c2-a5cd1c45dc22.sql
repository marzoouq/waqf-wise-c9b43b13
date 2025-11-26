-- ============================================
-- المرحلة 2: تحسينات قاعدة بيانات إدارة المستفيدين المتقدمة
-- ============================================

-- حذف الدوال القديمة أولاً
DROP FUNCTION IF EXISTS get_beneficiary_statistics(UUID);
DROP FUNCTION IF EXISTS get_family_statistics(UUID);

-- 1. إضافة أعمدة جديدة لجدول المستفيدين
ALTER TABLE beneficiaries
  ADD COLUMN IF NOT EXISTS verification_documents JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS verification_notes TEXT,
  ADD COLUMN IF NOT EXISTS last_verification_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verification_method VARCHAR(50),
  ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS eligibility_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS eligibility_notes TEXT,
  ADD COLUMN IF NOT EXISTS last_review_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS next_review_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS social_status_details JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS income_sources JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS disabilities JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS medical_conditions JSONB DEFAULT '[]'::jsonb;

-- إضافة check constraint منفصل
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'beneficiaries_risk_score_check'
  ) THEN
    ALTER TABLE beneficiaries ADD CONSTRAINT beneficiaries_risk_score_check CHECK (risk_score >= 0 AND risk_score <= 100);
  END IF;
END $$;

-- 2. تحسين جدول العائلات
ALTER TABLE families
  ADD COLUMN IF NOT EXISTS family_type VARCHAR(50) DEFAULT 'nuclear',
  ADD COLUMN IF NOT EXISTS income_level VARCHAR(50),
  ADD COLUMN IF NOT EXISTS housing_status VARCHAR(50),
  ADD COLUMN IF NOT EXISTS special_needs JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS family_metadata JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS average_age NUMERIC,
  ADD COLUMN IF NOT EXISTS dependents_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS contact_person_id UUID REFERENCES beneficiaries(id),
  ADD COLUMN IF NOT EXISTS emergency_contact JSONB DEFAULT '{}'::jsonb;

-- 3. جدول تصنيفات المستفيدين المحسّن
CREATE TABLE IF NOT EXISTS beneficiary_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  tag_name VARCHAR(100) NOT NULL,
  tag_category VARCHAR(50),
  tag_color VARCHAR(20),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(beneficiary_id, tag_name)
);

-- 4. جدول سجل التحقق من الهوية
CREATE TABLE IF NOT EXISTS identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL,
  verification_method VARCHAR(50) NOT NULL,
  verification_status VARCHAR(50) DEFAULT 'pending',
  verification_data JSONB DEFAULT '{}'::jsonb,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  expiry_date TIMESTAMPTZ,
  notes TEXT,
  documents JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. جدول معايير الأهلية
CREATE TABLE IF NOT EXISTS eligibility_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criterion_name VARCHAR(200) NOT NULL,
  criterion_type VARCHAR(50) NOT NULL,
  criterion_value JSONB NOT NULL,
  weight INTEGER DEFAULT 1,
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. جدول تقييم الأهلية
CREATE TABLE IF NOT EXISTS eligibility_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  assessment_date TIMESTAMPTZ DEFAULT NOW(),
  total_score NUMERIC,
  eligibility_status VARCHAR(50),
  criteria_scores JSONB DEFAULT '{}'::jsonb,
  recommendations TEXT,
  assessed_by UUID,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. جدول العلاقات الأسرية المعقدة
CREATE TABLE IF NOT EXISTS family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
  related_to_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
  relationship_type VARCHAR(100) NOT NULL,
  relationship_strength VARCHAR(20) DEFAULT 'primary',
  is_guardian BOOLEAN DEFAULT false,
  is_dependent BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(beneficiary_id, related_to_id, relationship_type)
);

-- 8. تحسين جدول البحث المحفوظ
ALTER TABLE saved_searches
  ADD COLUMN IF NOT EXISTS search_type VARCHAR(50) DEFAULT 'beneficiary',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS shared_with UUID[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS execution_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avg_execution_time_ms INTEGER;

-- 9. إنشاء Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_beneficiaries_verification_status ON beneficiaries(verification_status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_eligibility_status ON beneficiaries(eligibility_status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_family_id ON beneficiaries(family_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_tags ON beneficiaries USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_beneficiary_tags_beneficiary_id ON beneficiary_tags(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_beneficiary ON identity_verifications(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_family_relationships_family ON family_relationships(family_id);
CREATE INDEX IF NOT EXISTS idx_family_relationships_beneficiary ON family_relationships(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_assessments_beneficiary ON eligibility_assessments(beneficiary_id);

-- 10. دالة إحصائيات المستفيد الشاملة
CREATE OR REPLACE FUNCTION get_beneficiary_statistics(p_beneficiary_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_payments', COUNT(dd.id),
    'total_amount', COALESCE(SUM(dd.allocated_amount), 0),
    'pending_requests', (
      SELECT COUNT(*) FROM beneficiary_requests 
      WHERE beneficiary_id = p_beneficiary_id AND status = 'pending'
    ),
    'last_payment_date', MAX(dd.created_at),
    'verification_status', b.verification_status,
    'eligibility_status', b.eligibility_status,
    'family_members_count', (
      SELECT COUNT(*) FROM beneficiaries 
      WHERE family_id = b.family_id AND id != p_beneficiary_id
    )
  )
  INTO v_result
  FROM beneficiaries b
  LEFT JOIN distribution_details dd ON dd.beneficiary_id = b.id
  WHERE b.id = p_beneficiary_id
  GROUP BY b.id, b.verification_status, b.eligibility_status, b.family_id;
  
  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 11. دالة إحصائيات العائلة
CREATE OR REPLACE FUNCTION get_family_statistics(p_family_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_members', COUNT(*),
    'active_members', COUNT(*) FILTER (WHERE status = 'نشط'),
    'male_members', COUNT(*) FILTER (WHERE gender = 'ذكر'),
    'female_members', COUNT(*) FILTER (WHERE gender = 'أنثى'),
    'children_count', COUNT(*) FILTER (WHERE date_of_birth > CURRENT_DATE - INTERVAL '18 years'),
    'adults_count', COUNT(*) FILTER (WHERE date_of_birth <= CURRENT_DATE - INTERVAL '18 years'),
    'average_age', AVG(EXTRACT(YEAR FROM AGE(date_of_birth))),
    'total_income', SUM(monthly_income),
    'verified_members', COUNT(*) FILTER (WHERE verification_status = 'verified')
  )
  INTO v_result
  FROM beneficiaries
  WHERE family_id = p_family_id;
  
  RETURN COALESCE(v_result, '{}'::jsonb);
END;
$$;

-- 12. دالة تقييم الأهلية التلقائي
CREATE OR REPLACE FUNCTION auto_assess_eligibility(p_beneficiary_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_score NUMERIC := 0;
  v_max_score NUMERIC := 0;
  v_status VARCHAR(50);
  v_beneficiary RECORD;
BEGIN
  SELECT * INTO v_beneficiary FROM beneficiaries WHERE id = p_beneficiary_id;
  
  IF v_beneficiary.monthly_income IS NULL OR v_beneficiary.monthly_income < 3000 THEN
    v_score := v_score + 30;
  ELSIF v_beneficiary.monthly_income < 5000 THEN
    v_score := v_score + 20;
  ELSIF v_beneficiary.monthly_income < 8000 THEN
    v_score := v_score + 10;
  END IF;
  v_max_score := v_max_score + 30;
  
  IF v_beneficiary.family_size > 7 THEN
    v_score := v_score + 20;
  ELSIF v_beneficiary.family_size > 5 THEN
    v_score := v_score + 15;
  ELSIF v_beneficiary.family_size > 3 THEN
    v_score := v_score + 10;
  END IF;
  v_max_score := v_max_score + 20;
  
  IF v_beneficiary.employment_status IN ('عاطل', 'غير موظف') THEN
    v_score := v_score + 20;
  ELSIF v_beneficiary.employment_status IN ('موظف بدوام جزئي', 'أعمال حرة') THEN
    v_score := v_score + 10;
  END IF;
  v_max_score := v_max_score + 20;
  
  IF v_beneficiary.housing_type IN ('إيجار', 'مع العائلة') THEN
    v_score := v_score + 15;
  ELSIF v_beneficiary.housing_type = 'ملك جزئي' THEN
    v_score := v_score + 8;
  END IF;
  v_max_score := v_max_score + 15;
  
  IF v_beneficiary.marital_status IN ('أرمل', 'مطلق', 'أعزب مع إعالة') THEN
    v_score := v_score + 15;
  ELSIF v_beneficiary.marital_status = 'متزوج' AND v_beneficiary.family_size > 4 THEN
    v_score := v_score + 10;
  END IF;
  v_max_score := v_max_score + 15;
  
  v_score := ROUND((v_score / v_max_score) * 100, 2);
  
  IF v_score >= 70 THEN
    v_status := 'مؤهل بقوة';
  ELSIF v_score >= 50 THEN
    v_status := 'مؤهل';
  ELSIF v_score >= 30 THEN
    v_status := 'مؤهل جزئياً';
  ELSE
    v_status := 'غير مؤهل';
  END IF;
  
  UPDATE beneficiaries
  SET eligibility_status = v_status,
      last_review_date = NOW(),
      next_review_date = NOW() + INTERVAL '6 months'
  WHERE id = p_beneficiary_id;
  
  INSERT INTO eligibility_assessments (
    beneficiary_id, total_score, eligibility_status, assessed_by
  ) VALUES (p_beneficiary_id, v_score, v_status, auth.uid());
  
  RETURN jsonb_build_object('score', v_score, 'status', v_status, 'max_score', v_max_score);
END;
$$;

-- 13. Trigger لتحديث إحصائيات العائلة
CREATE OR REPLACE FUNCTION update_family_statistics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE families SET 
      total_members = (SELECT COUNT(*) FROM beneficiaries WHERE family_id = NEW.family_id),
      total_sons = (SELECT COUNT(*) FROM beneficiaries WHERE family_id = NEW.family_id AND gender = 'ذكر' AND relationship IN ('ابن', 'حفيد')),
      total_daughters = (SELECT COUNT(*) FROM beneficiaries WHERE family_id = NEW.family_id AND gender = 'أنثى' AND relationship IN ('بنت', 'حفيدة')),
      total_wives = (SELECT COUNT(*) FROM beneficiaries WHERE family_id = NEW.family_id AND relationship = 'زوجة'),
      average_age = (SELECT AVG(EXTRACT(YEAR FROM AGE(date_of_birth))) FROM beneficiaries WHERE family_id = NEW.family_id AND date_of_birth IS NOT NULL),
      updated_at = NOW()
    WHERE id = NEW.family_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE families SET 
      total_members = (SELECT COUNT(*) FROM beneficiaries WHERE family_id = OLD.family_id),
      updated_at = NOW()
    WHERE id = OLD.family_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_family_statistics ON beneficiaries;
CREATE TRIGGER trigger_update_family_statistics
AFTER INSERT OR UPDATE OR DELETE ON beneficiaries
FOR EACH ROW
EXECUTE FUNCTION update_family_statistics();

-- 14. RLS Policies
ALTER TABLE beneficiary_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_select_beneficiary_tags" ON beneficiary_tags FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_beneficiary_tags" ON beneficiary_tags FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_select_identity_verifications" ON identity_verifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_identity_verifications" ON identity_verifications FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_select_eligibility_criteria" ON eligibility_criteria FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_eligibility_criteria" ON eligibility_criteria FOR ALL TO authenticated USING (true);
CREATE POLICY "authenticated_select_eligibility_assessments" ON eligibility_assessments FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_eligibility_assessments" ON eligibility_assessments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_select_family_relationships" ON family_relationships FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_all_family_relationships" ON family_relationships FOR ALL TO authenticated USING (true);

GRANT ALL ON beneficiary_tags TO authenticated;
GRANT ALL ON identity_verifications TO authenticated;
GRANT ALL ON eligibility_criteria TO authenticated;
GRANT ALL ON eligibility_assessments TO authenticated;
GRANT ALL ON family_relationships TO authenticated;