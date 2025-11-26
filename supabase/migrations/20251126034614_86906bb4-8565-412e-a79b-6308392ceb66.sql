-- المرحلة 21 و 22: الأمان والأداء (مبسطة)

-- جدول المصادقة الثنائية
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  secret TEXT NOT NULL,
  backup_codes TEXT[],
  is_enabled BOOLEAN DEFAULT false,
  method TEXT DEFAULT 'totp',
  phone_number TEXT,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول جلسات الأمان
CREATE TABLE IF NOT EXISTS security_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  location JSONB,
  is_active BOOLEAN DEFAULT true,
  last_activity_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول محاولات الدخول
CREATE TABLE IF NOT EXISTS login_attempts_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email TEXT,
  ip_address INET NOT NULL,
  success BOOLEAN DEFAULT false,
  failure_reason TEXT,
  user_agent TEXT,
  location JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول أحداث الأمان
CREATE TABLE IF NOT EXISTS security_events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  user_id UUID,
  ip_address INET,
  event_data JSONB,
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول قواعد الأمان
CREATE TABLE IF NOT EXISTS security_rules_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  conditions JSONB NOT NULL,
  actions JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMPTZ,
  trigger_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- جدول البيانات المشفرة
CREATE TABLE IF NOT EXISTS encrypted_sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  encrypted_value TEXT NOT NULL,
  encryption_method TEXT DEFAULT 'aes-256',
  key_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- المرحلة 22: جداول الأداء والتحسينات

-- جدول ذاكرة التخزين المؤقت
CREATE TABLE IF NOT EXISTS cache_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  cache_value JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  hit_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول مراقبة الأداء
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  metadata JSONB,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- جدول سجل الاستعلامات البطيئة
CREATE TABLE IF NOT EXISTS slow_query_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  execution_time_ms INTEGER NOT NULL,
  user_id UUID,
  parameters JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_two_factor_user ON two_factor_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_security_sessions_user ON security_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_sessions_active ON security_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_login_log_ip ON login_attempts_log(ip_address, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_log_email ON login_attempts_log(user_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events_log(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cache_key ON cache_entries(cache_key);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);
CREATE INDEX IF NOT EXISTS idx_performance_name ON performance_metrics(metric_name, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_slow_query_time ON slow_query_log(execution_time_ms DESC, created_at DESC);

-- Triggers
CREATE TRIGGER update_two_factor_updated_at BEFORE UPDATE ON two_factor_auth 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_security_rules_updated_at BEFORE UPDATE ON security_rules_config 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_encrypted_data_updated_at BEFORE UPDATE ON encrypted_sensitive_data 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_rules_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_sensitive_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE cache_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE slow_query_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_2fa" ON two_factor_auth FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "users_own_sessions" ON security_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admin_only_login_log" ON login_attempts_log FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "admin_only_security_events" ON security_events_log FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "admin_only_security_rules" ON security_rules_config FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "admin_only_encrypted" ON encrypted_sensitive_data FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "all_auth_cache" ON cache_entries FOR ALL USING (auth.uid() IS NOT NULL);
CREATE POLICY "admin_only_performance" ON performance_metrics FOR ALL USING (is_admin_or_nazer());
CREATE POLICY "admin_only_slow_query" ON slow_query_log FOR ALL USING (is_admin_or_nazer());