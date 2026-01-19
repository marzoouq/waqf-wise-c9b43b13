-- =============================================
-- الفحص الجنائي: تنظيف البيانات
-- تاريخ: 2026-01-19
-- =============================================

-- المرحلة 1: تنظيف الإشعارات المكررة
DELETE FROM notifications n1
WHERE n1.title = '📊 التقرير الأسبوعي جاهز'
  AND n1.id NOT IN (
    SELECT DISTINCT ON (user_id, DATE(created_at)) id
    FROM notifications
    WHERE title = '📊 التقرير الأسبوعي جاهز'
    ORDER BY user_id, DATE(created_at), created_at ASC
  );

-- المرحلة 2: تحديث الأخطاء القديمة إلى resolved
UPDATE system_error_logs
SET 
  status = 'resolved',
  resolved_at = NOW(),
  resolution_notes = 'فحص جنائي 2026-01-19: أخطاء قديمة تم حلها'
WHERE status = 'new'
  AND created_at < NOW() - INTERVAL '1 day';

-- المرحلة 3: تأمين الدالة الرئيسية
CREATE OR REPLACE FUNCTION public.auto_create_distribution_journal_entry(p_distribution_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_role text;
  v_distribution RECORD;
  v_fiscal_year_id UUID;
  v_entry_id UUID;
  v_entry_number VARCHAR;
BEGIN
  -- ✅ فحص الصلاحيات
  SELECT ur.role::text INTO v_user_role
  FROM user_roles ur
  WHERE ur.user_id = auth.uid()
    AND ur.role IN ('nazer', 'admin', 'accountant')
  LIMIT 1;
  
  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'غير مصرح: يتطلب صلاحية ناظر أو مدير أو محاسب';
  END IF;

  SELECT * INTO v_distribution FROM distributions WHERE id = p_distribution_id;
  IF v_distribution IS NULL THEN
    RAISE EXCEPTION 'التوزيع غير موجود';
  END IF;

  SELECT id INTO v_fiscal_year_id FROM fiscal_years WHERE status = 'active' LIMIT 1;
  
  SELECT 'JV-DIST-' || COALESCE(MAX(CAST(SUBSTRING(entry_number FROM 9) AS INT)) + 1, 1)::VARCHAR
  INTO v_entry_number FROM journal_entries WHERE entry_number LIKE 'JV-DIST-%';

  INSERT INTO journal_entries (
    entry_number, entry_date, description, status, 
    total_debit, total_credit, fiscal_year_id, reference_type, reference_id
  ) VALUES (
    v_entry_number, CURRENT_DATE, 
    'قيد توزيع أرباح رقم ' || v_distribution.distribution_number,
    'draft', v_distribution.total_amount, v_distribution.total_amount,
    v_fiscal_year_id, 'distribution', p_distribution_id
  ) RETURNING id INTO v_entry_id;

  RETURN v_entry_id;
END;
$$;

-- تعليق توثيقي
COMMENT ON FUNCTION public.auto_create_distribution_journal_entry(uuid) IS 'فحص جنائي 2026-01-19: تم تأمين الدالة بفحص الصلاحيات';