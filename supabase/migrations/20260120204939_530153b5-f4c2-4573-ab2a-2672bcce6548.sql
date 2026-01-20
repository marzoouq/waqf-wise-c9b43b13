-- =====================================================
-- المرحلة 2: تكملة الحماية للجداول الثانوية + فرض Dual Control
-- =====================================================

-- 1. إضافة أعمدة soft-delete للجداول الثانوية المتبقية
DO $$
DECLARE
  tables_to_update text[] := ARRAY[
    'historical_rental_details',
    'translations', 
    'saved_searches',
    'user_permissions',
    'report_templates',
    'saved_filters',
    'search_history'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY tables_to_update
  LOOP
    -- إضافة deleted_at إذا لم يكن موجوداً
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = t AND column_name = 'deleted_at'
    ) THEN
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN deleted_at timestamptz DEFAULT NULL', t);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN deleted_by uuid DEFAULT NULL', t);
      EXECUTE format('ALTER TABLE public.%I ADD COLUMN deletion_reason text DEFAULT NULL', t);
      RAISE NOTICE 'Added soft-delete columns to %', t;
    END IF;
  END LOOP;
END $$;

-- 2. إنشاء فهارس جزئية للأداء على الجداول الجديدة
CREATE INDEX IF NOT EXISTS idx_historical_rental_not_deleted 
  ON public.historical_rental_details (fiscal_year_closing_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_translations_not_deleted 
  ON public.translations (key) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_saved_searches_not_deleted 
  ON public.saved_searches (user_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_permissions_not_deleted 
  ON public.user_permissions (user_id, permission_key) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_report_templates_not_deleted 
  ON public.report_templates (id) 
  WHERE deleted_at IS NULL;

-- 3. تطبيق triggers منع الحذف على الجداول الثانوية
DO $$
DECLARE
  secondary_tables text[] := ARRAY[
    'historical_rental_details',
    'translations', 
    'saved_searches',
    'report_templates'
  ];
  t text;
  trigger_name text;
BEGIN
  FOREACH t IN ARRAY secondary_tables
  LOOP
    trigger_name := 'prevent_delete_' || t;
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = trigger_name
    ) THEN
      EXECUTE format('
        CREATE TRIGGER %I
        BEFORE DELETE ON public.%I
        FOR EACH ROW
        EXECUTE FUNCTION public.prevent_hard_delete_financial()
      ', trigger_name, t);
      RAISE NOTICE 'Created trigger % on %', trigger_name, t;
    END IF;
  END LOOP;
END $$;

-- 4. تحسين دالة enforce_dual_control لتشمل distributions
CREATE OR REPLACE FUNCTION public.enforce_dual_control()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  amount_threshold numeric := 10000; -- عتبة المبلغ التي تتطلب اعتماد مزدوج
  current_amount numeric;
  v_created_by uuid;
  v_approved_by uuid;
BEGIN
  -- تحديد المبلغ حسب الجدول
  IF TG_TABLE_NAME = 'payment_vouchers' THEN
    current_amount := NEW.amount;
    v_created_by := NEW.created_by;
    v_approved_by := NEW.approved_by;
  ELSIF TG_TABLE_NAME = 'distributions' THEN
    current_amount := NEW.total_amount;
    v_created_by := NEW.created_by;
    v_approved_by := NEW.approved_by;
  ELSIF TG_TABLE_NAME = 'heir_distributions' THEN
    current_amount := NEW.share_amount;
    v_created_by := NEW.executed_by_user_id;
    v_approved_by := NULL; -- heir_distributions لا يتطلب موافقة منفصلة حالياً
    RETURN NEW; -- تخطي التحقق لهذا الجدول
  ELSE
    RETURN NEW;
  END IF;

  -- التحقق من Dual Control للمعاملات الكبيرة
  IF current_amount >= amount_threshold THEN
    -- إذا كان هناك محاولة للموافقة
    IF v_approved_by IS NOT NULL AND v_created_by IS NOT NULL THEN
      -- التحقق أن المنشئ ≠ المعتمد
      IF v_created_by = v_approved_by THEN
        RAISE EXCEPTION 'خطأ أمني: لا يمكن للمنشئ اعتماد معاملته الخاصة (Dual Control مطلوب للمبالغ ≥ % ريال)', amount_threshold
          USING ERRCODE = 'P0001';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 5. تطبيق trigger enforce_dual_control على distributions إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'enforce_dual_control_distributions' 
    AND tgrelid = 'public.distributions'::regclass
  ) THEN
    CREATE TRIGGER enforce_dual_control_distributions
    BEFORE INSERT OR UPDATE ON public.distributions
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_dual_control();
    RAISE NOTICE 'Created dual control trigger on distributions';
  END IF;
END $$;

-- 6. إضافة عمود approved_by للتوزيعات إذا لم يكن موجوداً
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'distributions' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE public.distributions ADD COLUMN approved_by uuid DEFAULT NULL;
    ALTER TABLE public.distributions ADD COLUMN approved_at timestamptz DEFAULT NULL;
    RAISE NOTICE 'Added approval columns to distributions';
  END IF;
END $$;

-- 7. التحقق النهائي من عدد Triggers النشطة
DO $$
DECLARE
  prevent_delete_count int;
  protect_created_count int;
  dual_control_count int;
BEGIN
  SELECT COUNT(*) INTO prevent_delete_count
  FROM pg_trigger WHERE tgname LIKE 'prevent_delete_%';
  
  SELECT COUNT(*) INTO protect_created_count
  FROM pg_trigger WHERE tgname LIKE 'protect_created_at_%';
  
  SELECT COUNT(*) INTO dual_control_count
  FROM pg_trigger WHERE tgname LIKE 'enforce_dual_control%';
  
  RAISE NOTICE '=== إحصائيات Triggers ===';
  RAISE NOTICE 'Prevent Delete Triggers: %', prevent_delete_count;
  RAISE NOTICE 'Protect Created_at Triggers: %', protect_created_count;
  RAISE NOTICE 'Dual Control Triggers: %', dual_control_count;
END $$;