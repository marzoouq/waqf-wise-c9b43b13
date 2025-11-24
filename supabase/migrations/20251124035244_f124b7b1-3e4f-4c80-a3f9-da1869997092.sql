-- المرحلة الخامسة: إضافة الجداول الجديدة فقط

-- 1. مقدمي خدمات الصيانة
CREATE TABLE maintenance_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  specialization TEXT[],
  rating DECIMAL(2,1) DEFAULT 0.0,
  total_jobs INTEGER DEFAULT 0,
  active_jobs INTEGER DEFAULT 0,
  average_cost DECIMAL(10,2),
  average_response_time INTEGER,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. سجل تقييمات مقدمي الخدمة
CREATE TABLE provider_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES maintenance_providers(id) ON DELETE CASCADE,
  maintenance_request_id UUID REFERENCES maintenance_requests(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  timeliness_score INTEGER CHECK (timeliness_score >= 1 AND timeliness_score <= 5),
  cost_score INTEGER CHECK (cost_score >= 1 AND cost_score <= 5),
  comments TEXT,
  rated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. تحديث maintenance_requests
ALTER TABLE maintenance_requests 
ADD COLUMN IF NOT EXISTS provider_id UUID REFERENCES maintenance_providers(id),
ADD COLUMN IF NOT EXISTS estimated_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS actual_cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES journal_entries(id);

-- 4. إضافة journal_entry_id إلى rental_payments
ALTER TABLE rental_payments
ADD COLUMN IF NOT EXISTS journal_entry_id UUID REFERENCES journal_entries(id);

-- 5. Indexes
CREATE INDEX idx_maintenance_providers_active ON maintenance_providers(is_active);
CREATE INDEX idx_maintenance_providers_specialization ON maintenance_providers USING gin(specialization);
CREATE INDEX idx_provider_ratings_provider ON provider_ratings(provider_id);
CREATE INDEX idx_maintenance_requests_provider ON maintenance_requests(provider_id);
CREATE INDEX idx_rental_payments_journal ON rental_payments(journal_entry_id);

-- 6. RLS Policies
ALTER TABLE maintenance_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_providers"
ON maintenance_providers FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nazer'::app_role));

CREATE POLICY "admins_manage_providers"
ON maintenance_providers FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins_view_ratings"
ON provider_ratings FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'nazer'::app_role));

CREATE POLICY "admins_manage_ratings"
ON provider_ratings FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 7. Function لتحديث التقييم
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE maintenance_providers
  SET rating = (
    SELECT COALESCE(AVG(rating), 0)::DECIMAL(2,1)
    FROM provider_ratings
    WHERE provider_id = NEW.provider_id
  ),
  total_jobs = (
    SELECT COUNT(*) FROM provider_ratings WHERE provider_id = NEW.provider_id
  )
  WHERE id = NEW.provider_id;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_provider_rating
AFTER INSERT OR UPDATE ON provider_ratings
FOR EACH ROW
EXECUTE FUNCTION update_provider_rating();

-- 8. Function للربط المحاسبي - دفعات الإيجار
CREATE OR REPLACE FUNCTION create_rental_payment_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry_id UUID;
  v_property_name TEXT;
  v_contract_number TEXT;
BEGIN
  IF NEW.status = 'مدفوع' AND (OLD IS NULL OR OLD.status != 'مدفوع') AND NEW.journal_entry_id IS NULL THEN
    
    SELECT p.name, c.contract_number INTO v_property_name, v_contract_number
    FROM contracts c
    JOIN properties p ON c.property_id = p.id
    WHERE c.id = NEW.contract_id;
    
    INSERT INTO journal_entries (
      entry_number,
      entry_date,
      description,
      total_debit,
      total_credit,
      status,
      created_by
    ) VALUES (
      'JE-RENT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(NEW.id::TEXT, 1, 8),
      NEW.payment_date,
      'دفعة إيجار - عقد ' || COALESCE(v_contract_number, '') || ' - عقار ' || COALESCE(v_property_name, ''),
      NEW.amount_paid,
      NEW.amount_paid,
      'معتمد',
      NEW.paid_by
    ) RETURNING id INTO v_entry_id;
    
    NEW.journal_entry_id = v_entry_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_create_rental_payment_entry
BEFORE INSERT OR UPDATE ON rental_payments
FOR EACH ROW
EXECUTE FUNCTION create_rental_payment_entry();