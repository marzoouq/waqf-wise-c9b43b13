
-- 🔧 إصلاح المرحلة الأولى والثانية - محاولة ثالثة

-- ============================================
-- 1. إنشاء Cron Job لتنظيف التنبيهات القديمة
-- ============================================

-- تفعيل pg_cron إذا لم يكن مفعلاً
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- محاولة حذف المهمة إذا كانت موجودة (تجاهل الخطأ)
DO $$
BEGIN
  PERFORM cron.unschedule('cleanup-alerts-weekly');
EXCEPTION WHEN OTHERS THEN
  -- المهمة غير موجودة، لا مشكلة
  NULL;
END $$;

-- جدولة تنظيف التنبيهات كل أحد الساعة 3 صباحاً
SELECT cron.schedule(
  'cleanup-alerts-weekly',
  '0 3 * * 0',
  $$
  -- أرشفة التنبيهات النشطة الأقدم من 30 يوم
  UPDATE system_alerts 
  SET status = 'archived'
  WHERE status = 'active' 
    AND created_at < NOW() - INTERVAL '30 days';
  
  -- حذف التنبيهات المؤرشفة الأقدم من 90 يوم
  DELETE FROM system_alerts
  WHERE status = 'archived'
    AND created_at < NOW() - INTERVAL '90 days';
  $$
);

-- ============================================
-- 2. تنظيف RLS Policies المتداخلة على bank_accounts
-- ============================================

-- حذف السياسات القديمة/المتداخلة (غير المحمية)
DO $$
BEGIN
  DROP POLICY IF EXISTS "first_class_beneficiaries_can_view_bank_accounts" ON bank_accounts;
  DROP POLICY IF EXISTS "unified_bank_accounts_policy" ON bank_accounts;
  DROP POLICY IF EXISTS "الأدوار المالية والمستفيدون من ال" ON bank_accounts;
  DROP POLICY IF EXISTS "Allow authenticated insert on bank_accounts" ON bank_accounts;
  DROP POLICY IF EXISTS "Allow authenticated update on bank_accounts" ON bank_accounts;
EXCEPTION WHEN OTHERS THEN
  -- تخطي إذا كانت السياسة محمية
  NULL;
END $$;

-- إضافة سياسات للإدراج والتحديث والحذف
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bank_accounts' 
    AND policyname = 'Only financial staff can insert bank accounts'
  ) THEN
    CREATE POLICY "Only financial staff can insert bank accounts"
    ON bank_accounts FOR INSERT
    TO authenticated
    WITH CHECK (
      has_role(auth.uid(), 'admin') 
      OR has_role(auth.uid(), 'nazer') 
      OR has_role(auth.uid(), 'accountant')
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bank_accounts' 
    AND policyname = 'Only financial staff can update bank accounts'
  ) THEN
    CREATE POLICY "Only financial staff can update bank accounts"
    ON bank_accounts FOR UPDATE
    TO authenticated
    USING (
      has_role(auth.uid(), 'admin') 
      OR has_role(auth.uid(), 'nazer') 
      OR has_role(auth.uid(), 'accountant')
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'bank_accounts' 
    AND policyname = 'Only financial staff can delete bank accounts'
  ) THEN
    CREATE POLICY "Only financial staff can delete bank accounts"
    ON bank_accounts FOR DELETE
    TO authenticated
    USING (
      has_role(auth.uid(), 'admin') 
      OR has_role(auth.uid(), 'nazer')
    );
  END IF;
END $$;

-- ============================================
-- 3. تنظيف RLS Policies المتداخلة على contracts
-- ============================================

DO $$
BEGIN
  DROP POLICY IF EXISTS "beneficiary_read_only_contracts" ON contracts;
  DROP POLICY IF EXISTS "secure_contracts_staff_only" ON contracts;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================
-- 4. تنظيف console.log من production-logger
-- ============================================
-- سيتم في الكود لاحقاً (استبدال console بـ productionLogger)

COMMENT ON EXTENSION pg_cron IS 'جدولة مهام تنظيف التنبيهات والأخطاء القديمة';
