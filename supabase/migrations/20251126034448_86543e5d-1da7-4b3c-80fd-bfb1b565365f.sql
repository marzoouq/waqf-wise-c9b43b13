-- المرحلة 20: التكاملات الخارجية

-- جدول تكاملات البنوك
CREATE TABLE IF NOT EXISTS bank_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_name TEXT NOT NULL,
  bank_code TEXT UNIQUE NOT NULL,
  api_endpoint TEXT,
  api_version TEXT,
  auth_method TEXT DEFAULT 'oauth',
  is_active BOOLEAN DEFAULT true,
  supports_transfers BOOLEAN DEFAULT false,
  supports_balance_inquiry BOOLEAN DEFAULT false,
  supports_statement BOOLEAN DEFAULT false,
  configuration JSONB DEFAULT '{}',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول سجل طلبات API الخارجية
CREATE TABLE IF NOT EXISTS external_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_type TEXT NOT NULL,
  integration_id UUID,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول تكاملات بوابات الدفع
CREATE TABLE IF NOT EXISTS payment_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name TEXT NOT NULL,
  gateway_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  merchant_id TEXT,
  configuration JSONB DEFAULT '{}',
  supported_methods TEXT[] DEFAULT ARRAY['card', 'wallet'],
  success_rate NUMERIC,
  total_transactions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول معاملات بوابات الدفع
CREATE TABLE IF NOT EXISTS gateway_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_id UUID REFERENCES payment_gateways(id),
  payment_voucher_id UUID REFERENCES payment_vouchers(id),
  beneficiary_id UUID REFERENCES beneficiaries(id),
  transaction_reference TEXT UNIQUE,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'SAR',
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  gateway_response JSONB,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول التكامل الحكومي
CREATE TABLE IF NOT EXISTS government_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  api_endpoint TEXT,
  is_active BOOLEAN DEFAULT true,
  requires_authentication BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'daily',
  configuration JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول استعلامات الأنظمة الحكومية
CREATE TABLE IF NOT EXISTS government_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id UUID REFERENCES government_integrations(id),
  query_type TEXT NOT NULL,
  national_id TEXT,
  query_payload JSONB,
  response_payload JSONB,
  status TEXT DEFAULT 'pending',
  verified BOOLEAN,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_external_api_logs_integration ON external_api_logs(integration_type, integration_id);
CREATE INDEX IF NOT EXISTS idx_external_api_logs_created ON external_api_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gateway_transactions_gateway ON gateway_transactions(gateway_id);
CREATE INDEX IF NOT EXISTS idx_gateway_transactions_beneficiary ON gateway_transactions(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_gateway_transactions_status ON gateway_transactions(status);
CREATE INDEX IF NOT EXISTS idx_government_queries_integration ON government_queries(integration_id);
CREATE INDEX IF NOT EXISTS idx_government_queries_national_id ON government_queries(national_id);

-- Triggers
CREATE TRIGGER update_bank_integrations_updated_at BEFORE UPDATE ON bank_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_gateways_updated_at BEFORE UPDATE ON payment_gateways 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_government_integrations_updated_at BEFORE UPDATE ON government_integrations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE bank_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_api_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE gateway_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only_bank_integrations" ON bank_integrations FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "all_auth_external_api_logs" ON external_api_logs FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_only_payment_gateways" ON payment_gateways FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "all_auth_gateway_transactions" ON gateway_transactions FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_only_government_integrations" ON government_integrations FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "all_auth_government_queries" ON government_queries FOR ALL USING (auth.uid() IS NOT NULL);

-- بيانات افتراضية
INSERT INTO bank_integrations (bank_name, bank_code, supports_transfers, supports_balance_inquiry, supports_statement) VALUES
  ('البنك الأهلي', 'NCB', true, true, true),
  ('بنك الراجحي', 'RJHI', true, true, true),
  ('بنك الرياض', 'RIBL', true, true, true)
ON CONFLICT DO NOTHING;

INSERT INTO payment_gateways (gateway_name, gateway_type, supported_methods) VALUES
  ('Moyasar', 'mada_visa', ARRAY['mada', 'visa', 'mastercard']),
  ('HyperPay', 'international', ARRAY['visa', 'mastercard', 'applepay'])
ON CONFLICT DO NOTHING;

INSERT INTO government_integrations (service_name, service_type, sync_frequency) VALUES
  ('أبشر', 'identity_verification', 'on_demand'),
  ('قوى', 'employment_verification', 'daily'),
  ('الضمان الاجتماعي', 'social_security', 'weekly')
ON CONFLICT DO NOTHING;