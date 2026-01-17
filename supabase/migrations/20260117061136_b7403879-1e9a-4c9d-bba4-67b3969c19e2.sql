-- ============================================
-- المرحلة 2: نظام استلام/تسليم الوحدات
-- ============================================

CREATE TABLE IF NOT EXISTS public.unit_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES property_units(id) ON DELETE SET NULL,
  handover_type TEXT NOT NULL CHECK (handover_type IN ('تسليم', 'استلام')),
  handover_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- حالة الوحدة
  electricity_meter_reading NUMERIC,
  water_meter_reading NUMERIC,
  gas_meter_reading NUMERIC,
  keys_count INTEGER DEFAULT 0,
  parking_cards_count INTEGER DEFAULT 0,
  access_cards_count INTEGER DEFAULT 0,
  remote_controls_count INTEGER DEFAULT 0,
  
  -- حالة العقار
  general_condition TEXT CHECK (general_condition IN ('ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'يحتاج صيانة')),
  cleanliness TEXT CHECK (cleanliness IN ('نظيف', 'يحتاج تنظيف', 'يحتاج تنظيف عميق')),
  condition_notes TEXT,
  damages JSONB DEFAULT '[]'::jsonb,
  photos TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- التوقيعات
  landlord_signature TEXT,
  landlord_signed_at TIMESTAMPTZ,
  tenant_signature TEXT,
  tenant_signed_at TIMESTAMPTZ,
  witness_name TEXT,
  witness_signature TEXT,
  
  -- التدقيق
  created_by UUID,
  created_by_name TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- المرحلة 3: نظام الإشعارات التعاقدية
-- ============================================

CREATE TABLE IF NOT EXISTS public.contract_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'تجديد', 'إنهاء', 'تعديل_إيجار', 'مخالفة', 'تحصيل', 'تذكير', 'إنذار', 'أخرى'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  delivery_method TEXT[] DEFAULT ARRAY['email']::TEXT[],
  status TEXT NOT NULL DEFAULT 'مسودة' CHECK (status IN ('مسودة', 'مُرسل', 'مُستلم', 'مقروء', 'فاشل')),
  
  -- معلومات الإرسال
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failure_reason TEXT,
  
  -- المستلم
  recipient_name TEXT,
  recipient_email TEXT,
  recipient_phone TEXT,
  
  -- التدقيق
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- المرحلة 4: تحسين نظام التجديد التلقائي
-- ============================================

ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS auto_renew_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auto_renew_cancelled_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS auto_renew_cancelled_by UUID,
ADD COLUMN IF NOT EXISTS auto_renew_cancel_reason TEXT,
ADD COLUMN IF NOT EXISTS renewal_period_months INTEGER DEFAULT 12;

-- ============================================
-- المرحلة 5: نظام طلبات الفسخ وتعديل الإيجار
-- ============================================

CREATE TABLE IF NOT EXISTS public.contract_termination_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE DEFAULT ('TRM-' || to_char(NOW(), 'YYYYMMDD-HH24MISS')),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL CHECK (requested_by IN ('المؤجر', 'المستأجر')),
  termination_type TEXT NOT NULL CHECK (termination_type IN ('فسخ بالتراضي', 'فسخ من طرف واحد')),
  requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reason TEXT NOT NULL,
  legal_basis TEXT,
  
  -- التسوية
  settlement_amount NUMERIC(15,2) DEFAULT 0,
  penalty_amount NUMERIC(15,2) DEFAULT 0,
  deposit_refund NUMERIC(15,2) DEFAULT 0,
  
  -- الحالة
  status TEXT NOT NULL DEFAULT 'معلق' CHECK (status IN ('معلق', 'قيد المراجعة', 'موافق', 'مرفوض', 'ملغي')),
  response_notes TEXT,
  responded_by UUID,
  responded_by_name TEXT,
  responded_at TIMESTAMPTZ,
  
  -- التدقيق
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rent_adjustment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT NOT NULL UNIQUE DEFAULT ('ADJ-' || to_char(NOW(), 'YYYYMMDD-HH24MISS')),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  requested_by TEXT NOT NULL CHECK (requested_by IN ('المؤجر', 'المستأجر')),
  adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('زيادة', 'تخفيض')),
  current_rent NUMERIC(15,2) NOT NULL,
  requested_rent NUMERIC(15,2) NOT NULL,
  adjustment_percentage NUMERIC(5,2),
  reason TEXT NOT NULL,
  supporting_documents TEXT[] DEFAULT ARRAY[]::TEXT[],
  effective_date DATE NOT NULL,
  
  -- الحالة
  status TEXT NOT NULL DEFAULT 'معلق' CHECK (status IN ('معلق', 'قيد التفاوض', 'موافق', 'مرفوض', 'ملغي')),
  final_rent NUMERIC(15,2),
  response_notes TEXT,
  responded_by UUID,
  responded_by_name TEXT,
  responded_at TIMESTAMPTZ,
  
  -- التدقيق
  created_by UUID,
  created_by_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- المرحلة 6: تسويات العقود (للإنهاء المبكر)
-- ============================================

CREATE TABLE IF NOT EXISTS public.contract_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_number TEXT NOT NULL UNIQUE DEFAULT ('SETT-' || to_char(NOW(), 'YYYYMMDD-HH24MISS')),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
  termination_reason TEXT,
  
  -- الحسابات
  total_contract_days INTEGER,
  used_days INTEGER,
  used_rent NUMERIC(15,2) DEFAULT 0,
  paid_rent NUMERIC(15,2) DEFAULT 0,
  security_deposit NUMERIC(15,2) DEFAULT 0,
  early_termination_penalty NUMERIC(15,2) DEFAULT 0,
  damages_deduction NUMERIC(15,2) DEFAULT 0,
  
  -- النتيجة
  net_settlement NUMERIC(15,2) NOT NULL,
  settlement_type TEXT NOT NULL CHECK (settlement_type IN ('استرداد_للمستأجر', 'مستحق_على_المستأجر', 'متوازن')),
  
  -- الربط المالي
  status TEXT NOT NULL DEFAULT 'معلق' CHECK (status IN ('معلق', 'موافق', 'مدفوع', 'ملغي')),
  voucher_id UUID REFERENCES payment_vouchers(id),
  journal_entry_id UUID REFERENCES journal_entries(id),
  
  -- التدقيق
  notes TEXT,
  created_by UUID,
  created_by_name TEXT,
  approved_by UUID,
  approved_by_name TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- الفهارس للأداء
-- ============================================

CREATE INDEX IF NOT EXISTS idx_unit_handovers_contract ON unit_handovers(contract_id);
CREATE INDEX IF NOT EXISTS idx_unit_handovers_type ON unit_handovers(handover_type);
CREATE INDEX IF NOT EXISTS idx_contract_notifications_contract ON contract_notifications(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_notifications_status ON contract_notifications(status);
CREATE INDEX IF NOT EXISTS idx_contract_termination_requests_contract ON contract_termination_requests(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_termination_requests_status ON contract_termination_requests(status);
CREATE INDEX IF NOT EXISTS idx_rent_adjustment_requests_contract ON rent_adjustment_requests(contract_id);
CREATE INDEX IF NOT EXISTS idx_rent_adjustment_requests_status ON rent_adjustment_requests(status);
CREATE INDEX IF NOT EXISTS idx_contract_settlements_contract ON contract_settlements(contract_id);
CREATE INDEX IF NOT EXISTS idx_contracts_auto_renew ON contracts(auto_renew_enabled) WHERE auto_renew_enabled = TRUE;

-- ============================================
-- سياسات RLS
-- ============================================

ALTER TABLE unit_handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_termination_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE rent_adjustment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_settlements ENABLE ROW LEVEL SECURITY;

-- السماح للمستخدمين المصادق عليهم
CREATE POLICY "authenticated_select_unit_handovers" ON unit_handovers FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_unit_handovers" ON unit_handovers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_unit_handovers" ON unit_handovers FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_select_contract_notifications" ON contract_notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_contract_notifications" ON contract_notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_contract_notifications" ON contract_notifications FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_select_termination_requests" ON contract_termination_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_termination_requests" ON contract_termination_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_termination_requests" ON contract_termination_requests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_select_rent_adjustments" ON rent_adjustment_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_rent_adjustments" ON rent_adjustment_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_rent_adjustments" ON rent_adjustment_requests FOR UPDATE TO authenticated USING (true);

CREATE POLICY "authenticated_select_settlements" ON contract_settlements FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated_insert_settlements" ON contract_settlements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "authenticated_update_settlements" ON contract_settlements FOR UPDATE TO authenticated USING (true);