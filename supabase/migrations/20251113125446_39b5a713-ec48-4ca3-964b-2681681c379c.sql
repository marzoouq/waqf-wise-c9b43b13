-- =========================================
-- إصلاحات حرجة لبوابة المستفيد
-- =========================================

-- 1. إنشاء Storage Bucket للمستندات
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'beneficiary-documents',
  'beneficiary-documents',
  false,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- 2. RLS Policies للـ Storage Bucket
CREATE POLICY "المستفيدون يمكنهم رفع مستنداتهم"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'beneficiary-documents' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

CREATE POLICY "المستفيدون يمكنهم عرض مستنداتهم"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'beneficiary-documents'
  AND (
    (storage.foldername(name))[1]::uuid IN (
      SELECT id FROM beneficiaries WHERE user_id = auth.uid()
    )
    OR auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role IN ('admin', 'nazer', 'archivist')
    )
  )
);

CREATE POLICY "المستفيدون يمكنهم حذف مستنداتهم"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'beneficiary-documents'
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM beneficiaries WHERE user_id = auth.uid()
  )
);

CREATE POLICY "الإداريون يمكنهم إدارة كل المستندات"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'beneficiary-documents'
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'nazer')
  )
)
WITH CHECK (
  bucket_id = 'beneficiary-documents'
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role IN ('admin', 'nazer')
  )
);

-- 3. إضافة حقل beneficiary_id لجدول payments إن لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name = 'beneficiary_id'
  ) THEN
    ALTER TABLE payments ADD COLUMN beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL;
    CREATE INDEX idx_payments_beneficiary_id ON payments(beneficiary_id);
  END IF;
END $$;

-- 4. إضافة Foreign Keys مع Cascade
ALTER TABLE beneficiary_requests 
DROP CONSTRAINT IF EXISTS beneficiary_requests_beneficiary_id_fkey,
ADD CONSTRAINT beneficiary_requests_beneficiary_id_fkey 
  FOREIGN KEY (beneficiary_id) 
  REFERENCES beneficiaries(id) 
  ON DELETE CASCADE;

ALTER TABLE beneficiary_attachments
DROP CONSTRAINT IF EXISTS beneficiary_attachments_beneficiary_id_fkey,
ADD CONSTRAINT beneficiary_attachments_beneficiary_id_fkey
  FOREIGN KEY (beneficiary_id)
  REFERENCES beneficiaries(id)
  ON DELETE CASCADE;

ALTER TABLE beneficiary_activity_log
DROP CONSTRAINT IF EXISTS beneficiary_activity_log_beneficiary_id_fkey,
ADD CONSTRAINT beneficiary_activity_log_beneficiary_id_fkey
  FOREIGN KEY (beneficiary_id)
  REFERENCES beneficiaries(id)
  ON DELETE CASCADE;

-- 5. إضافة Indexes للأداء
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_email ON beneficiaries(email);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON beneficiaries(status);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_status ON beneficiary_requests(status);
CREATE INDEX IF NOT EXISTS idx_beneficiary_requests_submitted_at ON beneficiary_requests(submitted_at DESC);

-- 6. إضافة حقول للإشعارات إن لم تكن موجودة
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'notification_preferences'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": false}'::jsonb;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'last_notification_at'
  ) THEN
    ALTER TABLE beneficiaries ADD COLUMN last_notification_at TIMESTAMP WITH TIME ZONE;
  END IF;
END $$;

-- 7. دالة لحساب القسط الشهري بشكل صحيح
CREATE OR REPLACE FUNCTION calculate_monthly_payment(
  principal NUMERIC,
  annual_rate NUMERIC,
  months INTEGER
) RETURNS NUMERIC AS $$
DECLARE
  monthly_rate NUMERIC;
  payment NUMERIC;
BEGIN
  -- إذا لم تكن هناك فائدة
  IF annual_rate = 0 OR annual_rate IS NULL THEN
    RETURN principal / months;
  END IF;
  
  -- حساب معدل الفائدة الشهري
  monthly_rate := annual_rate / 12 / 100;
  
  -- معادلة حساب القسط الشهري: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
  payment := principal * (monthly_rate * POWER(1 + monthly_rate, months)) / 
             (POWER(1 + monthly_rate, months) - 1);
  
  RETURN ROUND(payment, 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. تحديث constraint لجدول beneficiary_requests
ALTER TABLE beneficiary_requests
DROP CONSTRAINT IF EXISTS beneficiary_requests_amount_check,
ADD CONSTRAINT beneficiary_requests_amount_check 
  CHECK (amount IS NULL OR (amount >= 0 AND amount <= 1000000));

COMMENT ON CONSTRAINT beneficiary_requests_amount_check ON beneficiary_requests IS 
  'الحد الأقصى للمبلغ المطلوب هو مليون ريال';

-- 9. إنشاء View لإحصائيات المستفيد
CREATE OR REPLACE VIEW beneficiary_statistics AS
SELECT 
  b.id,
  b.full_name,
  b.user_id,
  COUNT(DISTINCT br.id) as total_requests,
  COUNT(DISTINCT br.id) FILTER (WHERE br.status = 'موافق عليه') as approved_requests,
  COUNT(DISTINCT br.id) FILTER (WHERE br.status = 'قيد المراجعة') as pending_requests,
  COALESCE(SUM(p.amount), 0) as total_payments,
  COUNT(DISTINCT p.id) as payment_count,
  COUNT(DISTINCT ba.id) as attachments_count,
  MAX(br.submitted_at) as last_request_date,
  MAX(p.payment_date) as last_payment_date
FROM beneficiaries b
LEFT JOIN beneficiary_requests br ON br.beneficiary_id = b.id
LEFT JOIN payments p ON p.beneficiary_id = b.id
LEFT JOIN beneficiary_attachments ba ON ba.beneficiary_id = b.id
GROUP BY b.id, b.full_name, b.user_id;

-- RLS Policy للـ View
ALTER VIEW beneficiary_statistics SET (security_barrier = true);
ALTER VIEW beneficiary_statistics SET (security_invoker = true);

-- 10. Trigger للتحديث التلقائي لتاريخ آخر نشاط
CREATE OR REPLACE FUNCTION update_beneficiary_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE beneficiaries
  SET updated_at = now()
  WHERE id = NEW.beneficiary_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS tr_update_beneficiary_on_request ON beneficiary_requests;
CREATE TRIGGER tr_update_beneficiary_on_request
  AFTER INSERT OR UPDATE ON beneficiary_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_beneficiary_last_activity();

DROP TRIGGER IF EXISTS tr_update_beneficiary_on_attachment ON beneficiary_attachments;
CREATE TRIGGER tr_update_beneficiary_on_attachment
  AFTER INSERT ON beneficiary_attachments
  FOR EACH ROW
  EXECUTE FUNCTION update_beneficiary_last_activity();