-- ===================================
-- المصادقة الثنائية (2FA)
-- ===================================
CREATE TABLE IF NOT EXISTS two_factor_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  secret TEXT NOT NULL,
  backup_codes TEXT[] NOT NULL,
  enabled BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE two_factor_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "المستخدمون يمكنهم إدارة 2FA الخاص بهم"
ON two_factor_secrets FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===================================
-- الإشعارات الخارجية (Push Notifications)
-- ===================================
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, endpoint)
);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "المستخدمون يمكنهم إدارة اشتراكاتهم"
ON push_subscriptions FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===================================
-- التقارير المخصصة
-- ===================================
CREATE TABLE IF NOT EXISTS custom_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  report_type TEXT NOT NULL, -- 'sql', 'chart', 'ai'
  configuration JSONB NOT NULL, -- يحتوي على SQL أو إعدادات المخطط
  is_shared BOOLEAN DEFAULT false,
  is_favorite BOOLEAN DEFAULT false,
  run_count INTEGER DEFAULT 0,
  last_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE custom_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "المستخدمون يمكنهم إدارة تقاريرهم"
ON custom_reports FOR ALL
USING (created_by = auth.uid() OR is_shared = true)
WITH CHECK (created_by = auth.uid());

-- ===================================
-- سجل النسخ الاحتياطي
-- ===================================
CREATE TABLE IF NOT EXISTS backup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_type TEXT NOT NULL, -- 'full', 'incremental', 'tables'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  file_size BIGINT,
  file_path TEXT,
  tables_included TEXT[],
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE backup_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "المسؤولون يمكنهم عرض سجل النسخ الاحتياطي"
ON backup_logs FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'nazer'));

-- ===================================
-- سجل معالجة OCR
-- ===================================
CREATE TABLE IF NOT EXISTS ocr_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  attachment_id UUID REFERENCES beneficiary_attachments(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  extracted_text TEXT,
  confidence_score NUMERIC,
  processing_time_ms INTEGER,
  error_message TEXT,
  processed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE ocr_processing_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "المستخدمون المصرح لهم يمكنهم عرض سجل OCR"
ON ocr_processing_log FOR SELECT
USING (
  has_role(auth.uid(), 'admin') OR 
  has_role(auth.uid(), 'archivist') OR
  processed_by = auth.uid()
);

-- ===================================
-- التنبيهات الذكية
-- ===================================
CREATE TABLE IF NOT EXISTS smart_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL, -- 'prediction', 'anomaly', 'recommendation'
  severity TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE smart_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "المسؤولون والناظر يمكنهم عرض التنبيهات الذكية"
ON smart_alerts FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'nazer') OR has_role(auth.uid(), 'accountant'));

CREATE POLICY "المسؤولون يمكنهم إدارة التنبيهات"
ON smart_alerts FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'nazer'));

-- ===================================
-- دالة للتحقق من 2FA
-- ===================================
CREATE OR REPLACE FUNCTION verify_2fa_code(
  p_user_id UUID,
  p_code TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_secret TEXT;
  v_backup_codes TEXT[];
BEGIN
  SELECT secret, backup_codes INTO v_secret, v_backup_codes
  FROM two_factor_secrets
  WHERE user_id = p_user_id AND enabled = true;
  
  IF v_secret IS NULL THEN
    RETURN false;
  END IF;
  
  -- في الإنتاج، يجب التحقق من الكود باستخدام مكتبة TOTP
  -- هنا نتحقق فقط من backup codes
  IF p_code = ANY(v_backup_codes) THEN
    -- إزالة الكود المستخدم
    UPDATE two_factor_secrets
    SET backup_codes = array_remove(backup_codes, p_code),
        updated_at = now()
    WHERE user_id = p_user_id;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ===================================
-- دالة لإنشاء تقرير ذكي بـ AI
-- ===================================
CREATE OR REPLACE FUNCTION generate_smart_insights()
RETURNS void AS $$
DECLARE
  v_overdue_loans INTEGER;
  v_expiring_contracts INTEGER;
  v_pending_requests INTEGER;
BEGIN
  -- التحقق من القروض المتأخرة
  SELECT COUNT(*) INTO v_overdue_loans
  FROM loans
  WHERE status = 'defaulted';
  
  IF v_overdue_loans > 5 THEN
    INSERT INTO smart_alerts (alert_type, severity, title, description, action_url, data)
    VALUES (
      'anomaly',
      'critical',
      'تنبيه: زيادة في القروض المتأخرة',
      format('يوجد %s قرض متأخر. يُنصح بمتابعة المستفيدين وتفعيل خطط السداد.', v_overdue_loans),
      '/loans',
      jsonb_build_object('count', v_overdue_loans, 'type', 'overdue_loans')
    );
  END IF;
  
  -- التحقق من العقود القاربة على الانتهاء
  SELECT COUNT(*) INTO v_expiring_contracts
  FROM contracts
  WHERE status = 'نشط' AND end_date <= CURRENT_DATE + INTERVAL '30 days';
  
  IF v_expiring_contracts > 0 THEN
    INSERT INTO smart_alerts (alert_type, severity, title, description, action_url, data)
    VALUES (
      'recommendation',
      'warning',
      format('توصية: %s عقد قارب على الانتهاء', v_expiring_contracts),
      'يُنصح بالتواصل مع المستأجرين لتجديد العقود أو البحث عن مستأجرين جدد.',
      '/properties?tab=contracts',
      jsonb_build_object('count', v_expiring_contracts, 'type', 'expiring_contracts')
    );
  END IF;
  
  -- التحقق من الطلبات المعلقة لفترة طويلة
  SELECT COUNT(*) INTO v_pending_requests
  FROM beneficiary_requests
  WHERE status = 'قيد المراجعة' 
    AND submitted_at < now() - INTERVAL '7 days';
  
  IF v_pending_requests > 0 THEN
    INSERT INTO smart_alerts (alert_type, severity, title, description, action_url, data)
    VALUES (
      'anomaly',
      'warning',
      format('تنبيه: %s طلب معلق منذ أكثر من أسبوع', v_pending_requests),
      'هناك طلبات تحتاج إلى مراجعة عاجلة لتحسين وقت الاستجابة.',
      '/requests',
      jsonb_build_object('count', v_pending_requests, 'type', 'pending_requests')
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ===================================
-- Indexes للأداء
-- ===================================
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_reports_created_by ON custom_reports(created_by);
CREATE INDEX IF NOT EXISTS idx_backup_logs_status ON backup_logs(status);
CREATE INDEX IF NOT EXISTS idx_ocr_processing_status ON ocr_processing_log(status);
CREATE INDEX IF NOT EXISTS idx_smart_alerts_severity ON smart_alerts(severity, is_read);